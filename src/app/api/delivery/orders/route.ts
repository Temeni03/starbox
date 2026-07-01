import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'delivery') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const filter_param = searchParams.get('filter') ?? 'active'

  await connectDB()

  const statusFilter =
    filter_param === 'completed'
      ? { $in: ['delivered', 'cancelled'] }
      : { $in: ['confirmed', 'transit'] }

  const orders = await Order.find({
    assignedTo: session.user.id,
    status: statusFilter,
  })
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json({ orders })
}
