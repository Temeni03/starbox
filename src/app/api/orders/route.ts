import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'
import { AppConfig } from '@/models/AppConfig'
import { sendPushToRole } from '@/lib/webpush'

const CheckoutSchema = z.object({
  deliveryOption: z.enum(['home', 'pickup']),
  deliveryAddress: z.string().trim().optional(),
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

  const { deliveryOption, deliveryAddress, paymentMethod, paymentScreenshot } = parsed.data

  if (deliveryOption === 'home' && !deliveryAddress) {
    return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })
  }
  if (paymentMethod === 'bank_transfer' && !paymentScreenshot) {
    return NextResponse.json({ error: 'Payment screenshot is required' }, { status: 400 })
  }

  await connectDB()

  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Validate stock for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product)
    if (!product || !product.isActive) {
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

  const feeConfig = await AppConfig.findOne({ key: 'delivery_fee' })
  const deliveryFee = deliveryOption === 'home' ? parseInt(feeConfig?.value ?? '500') : 0
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
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    cartTotal,
    deliveryFee,
    grandTotal: cartTotal + deliveryFee,
    deliveryOption,
    deliveryAddress,
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

  // Decrement stock
  await Promise.all(
    cart.items.map((item: any) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      })
    )
  )

  // Clear cart
  cart.items = []
  await cart.save()

  sendPushToRole('admin', {
    title: 'StarBox — New Order',
    body: `${session.user.name} placed order ${order.orderNumber} (${(cartTotal + deliveryFee).toLocaleString()} DA)`,
    url: `/admin/orders/${order._id}`,
  }).catch(() => {})

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
