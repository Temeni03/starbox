import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Product } from '@/models/Product'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await params
  const { quantity } = await req.json()

  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
  }

  await connectDB()

  const product = await Product.findById(productId).lean()
  if (!product || !(product as any).isActive) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  if ((product as any).quantity < quantity) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
  }

  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  const item = cart.items.find((i: any) => i.product.toString() === productId)
  if (!item) return NextResponse.json({ error: 'Item not in cart' }, { status: 404 })

  item.quantity = quantity
  await cart.save()

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await params

  await connectDB()

  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  cart.items = cart.items.filter((i: any) => i.product.toString() !== productId)
  await cart.save()

  return NextResponse.json({ success: true })
}
