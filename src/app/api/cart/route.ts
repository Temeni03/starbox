import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Product } from '@/models/Product'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart) return NextResponse.json({ cart: { items: [] } })

  // Drop items whose product was deleted (e.g. removed and re-created), which would
  // otherwise leave a stale reference that always fails at checkout.
  const existingIds = new Set(
    (
      await Product.find({ _id: { $in: cart.items.map((i: any) => i.product) } })
        .select('_id')
        .lean()
    ).map((p: any) => p._id.toString())
  )
  const originalCount = cart.items.length
  cart.items = cart.items.filter((i: any) => existingIds.has(i.product.toString())) as any
  if (cart.items.length !== originalCount) {
    await cart.save()
  }

  await cart.populate('items.product', 'name price images quantity isActive')

  return NextResponse.json({ cart: cart.toObject() })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity = 1 } = await req.json()
  if (!productId || quantity < 1) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  await connectDB()

  const product = await Product.findOne({ _id: productId, isActive: true })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.quantity < quantity) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
  }
  const locale = await getRequestLocale()

  let cart = await Cart.findOne({ user: session.user.id })
  if (!cart) {
    cart = new Cart({ user: session.user.id, items: [] })
  }

  const existingIdx = cart.items.findIndex(
    (i: any) => i.product.toString() === productId
  )

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx].quantity + quantity
    if (newQty > product.quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
    }
    cart.items[existingIdx].quantity = newQty
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      name: resolveLocalized(product.name, locale),
      image: product.images?.[0],
    })
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
