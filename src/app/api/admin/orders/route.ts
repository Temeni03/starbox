import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const skip = (page - 1) * limit

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (status && status !== 'all') filter.status = status

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name phone')
      .populate('assignedTo', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ])

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
}
