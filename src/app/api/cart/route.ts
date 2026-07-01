import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Product } from '@/models/Product'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const cart = await Cart.findOne({ user: session.user.id })
    .populate('items.product', 'name price images quantity isActive')
    .lean()

  return NextResponse.json({ cart: cart ?? { items: [] } })
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
      name: product.name,
      image: product.images?.[0],
    })
  }

  await cart.save()
  return NextResponse.json({ success: true, itemCount: cart.items.length })
}
