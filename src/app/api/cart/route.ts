import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Product } from '@/models/Product'
import { Box } from '@/models/Box'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'
import { activeBoxFilter } from '@/lib/boxAvailability'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart) return NextResponse.json({ cart: { items: [] } })

  // Drop items whose product/box was deleted (e.g. removed and re-created), which would
  // otherwise leave a stale reference that always fails at checkout.
  const productIds = cart.items.filter((i: any) => i.itemType !== 'Box').map((i: any) => i.product)
  const boxIds = cart.items.filter((i: any) => i.itemType === 'Box').map((i: any) => i.product)

  const [existingProductIds, existingBoxIds] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).select('_id').lean()
      .then((docs) => new Set(docs.map((p: any) => p._id.toString()))),
    Box.find({ _id: { $in: boxIds } }).select('_id').lean()
      .then((docs) => new Set(docs.map((b: any) => b._id.toString()))),
  ])

  const originalCount = cart.items.length
  cart.items = cart.items.filter((i: any) =>
    i.itemType === 'Box'
      ? existingBoxIds.has(i.product.toString())
      : existingProductIds.has(i.product.toString())
  ) as any
  if (cart.items.length !== originalCount) {
    await cart.save()
  }

  return NextResponse.json({ cart: cart.toObject() })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const itemId: string | undefined = body.itemId ?? body.productId
  const itemType: 'product' | 'box' = body.itemType === 'box' ? 'box' : 'product'
  const quantity: number = body.quantity ?? 1

  if (!itemId || quantity < 1) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  await connectDB()
  const locale = await getRequestLocale()

  let cart = await Cart.findOne({ user: session.user.id })
  if (!cart) {
    cart = new Cart({ user: session.user.id, items: [] })
  }

  const existingIdx = cart.items.findIndex(
    (i: any) => i.product.toString() === itemId && i.itemType === (itemType === 'box' ? 'Box' : 'Product')
  )

  if (itemType === 'box') {
    const box = await Box.findOne({ _id: itemId, ...activeBoxFilter() })
    if (!box) return NextResponse.json({ error: 'Box not found' }, { status: 404 })

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity
    } else {
      cart.items.push({
        product: itemId,
        itemType: 'Box',
        quantity,
        price: box.price,
        name: resolveLocalized(box.name, locale),
        image: box.coverImage,
      })
    }
  } else {
    const product = await Product.findOne({ _id: itemId, isActive: true })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
    }

    if (existingIdx >= 0) {
      const newQty = cart.items[existingIdx].quantity + quantity
      if (newQty > product.quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
      }
      cart.items[existingIdx].quantity = newQty
    } else {
      cart.items.push({
        product: itemId,
        itemType: 'Product',
        quantity,
        price: product.price,
        name: resolveLocalized(product.name, locale),
        image: product.images?.[0],
      })
    }
  }

  await cart.save()
  return NextResponse.json({ success: true, itemCount: cart.items.length })
}

export async function DELETE() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await Cart.findOneAndUpdate({ user: session.user.id }, { items: [] })

  return NextResponse.json({ success: true })
}
