import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Cart } from '@/models/Cart'
import { Product } from '@/models/Product'
import { Box } from '@/models/Box'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await params
  const { quantity } = await req.json()

  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
  }

  await connectDB()

  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  const item = cart.items.find((i: any) => i.product.toString() === itemId)
  if (!item) return NextResponse.json({ error: 'Item not in cart' }, { status: 404 })

  if (item.itemType === 'Box') {
    const box = await Box.findById(itemId).lean()
    if (!box || !(box as any).isActive) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 })
    }
  } else {
    const product = await Product.findById(itemId).lean()
    if (!product || !(product as any).isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if ((product as any).quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
    }
  }

  item.quantity = quantity
  await cart.save()

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await params

  await connectDB()

  const cart = await Cart.findOne({ user: session.user.id })
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  cart.items = cart.items.filter((i: any) => i.product.toString() !== itemId)
  await cart.save()

  return NextResponse.json({ success: true })
}
