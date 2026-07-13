import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'
import { Box } from '@/models/Box'
import { Location } from '@/models/Location'
import { notifyRole, notifyUser } from '@/lib/notify'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'
import { activeBoxFilter } from '@/lib/boxAvailability'

const CheckoutSchema = z.object({
  deliveryOption: z.enum(['home', 'pickup']),
  deliveryLocationId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer']),
  paymentScreenshot: z.string().url().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { deliveryOption, deliveryLocationId, paymentMethod, paymentScreenshot } = parsed.data

  if (deliveryOption === 'home' && !deliveryLocationId) {
    return NextResponse.json({ error: 'Please select a delivery location' }, { status: 400 })
  }
  if (paymentMethod === 'bank_transfer' && !paymentScreenshot) {
    return NextResponse.json({ error: 'Payment screenshot is required' }, { status: 400 })
  }

  await connectDB()
  const locale = await getRequestLocale()

  let deliveryLocation = null
  if (deliveryOption === 'home') {
    if (!/^[0-9a-fA-F]{24}$/.test(deliveryLocationId!)) {
      return NextResponse.json({ error: 'Please select a delivery location' }, { status: 400 })
    }
    deliveryLocation = await Location.findOne({ _id: deliveryLocationId, isActive: true })
    if (!deliveryLocation) {
      return NextResponse.json({ error: 'Selected delivery location is not available' }, { status: 400 })
    }
  }

  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Validate stock/availability for all items. A missing product/box means the cart is
  // holding a stale reference (e.g. it was deleted and re-created) — prune it instead of
  // permanently blocking checkout on an item the customer can't act on.
  const staleItems: { name: string; productId: string }[] = []
  for (const item of cart.items) {
    if (item.itemType === 'Box') {
      const box = await Box.findOne({ _id: item.product, ...activeBoxFilter() })
      if (!box) {
        staleItems.push({ name: item.name, productId: item.product.toString() })
        continue
      }
      continue
    }
    const product = await Product.findById(item.product)
    if (!product) {
      staleItems.push({ name: item.name, productId: item.product.toString() })
      continue
    }
    if (!product.isActive) {
      return NextResponse.json(
        { error: `Product "${item.name}" is no longer available` },
        { status: 409 }
      )
    }
    if (product.quantity < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for "${item.name}"` },
        { status: 409 }
      )
    }
  }

  if (staleItems.length > 0) {
    const staleIds = new Set(staleItems.map((i) => i.productId))
    cart.items = cart.items.filter((item: any) => !staleIds.has(item.product.toString()))
    await cart.save()
    const names = staleItems.map((i) => `"${i.name}"`).join(', ')
    return NextResponse.json(
      {
        error: `${names} ${staleItems.length > 1 ? 'are' : 'is'} no longer available and ${
          staleItems.length > 1 ? 'have' : 'has'
        } been removed from your cart. Please review your cart and try again.`,
      },
      { status: 409 }
    )
  }

  const deliveryFee = deliveryOption === 'home' ? deliveryLocation!.price : 0
  const cartTotal = cart.items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  )

  const count = await Order.countDocuments()
  const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`

  const order = await Order.create({
    orderNumber,
    customer: session.user.id,
    items: cart.items.map((i: any) => ({
      product: i.product,
      itemType: i.itemType,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    cartTotal,
    deliveryFee,
    grandTotal: cartTotal + deliveryFee,
    deliveryOption,
    deliveryAddress: deliveryLocation ? resolveLocalized(deliveryLocation.name, locale) : undefined,
    deliveryLocation: deliveryLocation?._id,
    paymentMethod,
    paymentScreenshot,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        changedAt: new Date(),
        changedBy: session.user.id,
      },
    ],
  })

  // Decrement stock (products only — boxes don't track their own inventory)
  const updatedProducts = await Promise.all(
    cart.items
      .filter((item: any) => item.itemType !== 'Box')
      .map((item: any) =>
        Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: -item.quantity } },
          { new: true }
        )
      )
  )

  // Clear cart
  cart.items = []
  await cart.save()

  notifyUser(session.user.id, {
    type: 'order_submitted',
    params: { orderNumber: order.orderNumber },
    url: `/orders/${order._id}`,
  }).catch(() => {})

  notifyRole('admin', {
    type: 'new_order',
    params: {
      name: session.user.name,
      orderNumber: order.orderNumber,
      amount: (cartTotal + deliveryFee).toLocaleString(),
    },
    url: `/admin/orders/${order._id}`,
  }).catch(() => {})

  if (paymentMethod === 'bank_transfer') {
    notifyRole('admin', {
      type: 'payment_submitted',
      params: { name: session.user.name, orderNumber: order.orderNumber },
      url: `/admin/orders/${order._id}`,
    }).catch(() => {})
  }

  for (const product of updatedProducts) {
    if (product?.isActive && product.quantity <= product.lowStockThreshold) {
      notifyRole('admin', {
        type: 'low_stock',
        params: { productName: product.name, quantity: product.quantity },
        url: `/admin/products`,
      }).catch(() => {})
    }
  }

  return NextResponse.json({ success: true, orderId: order._id, orderNumber: order.orderNumber }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const orders = await Order.find({ customer: session.user.id })
    .select('orderNumber status grandTotal createdAt items deliveryOption')
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json({ orders })
}
