import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await connectDB()

  const order = await Order.findById(id)
    .populate('items.product', 'name images')
    .lean()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const customerId = (order as any).customer?.toString() ?? order.customer
  if (customerId !== session.user.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ order })
}
