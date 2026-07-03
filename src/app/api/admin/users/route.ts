import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') ?? 'customer'

  await connectDB()

  const users = await User.find({ role })
    .select('name phone address isActive createdAt')
    .sort({ createdAt: -1 })
    .lean()

  if (role !== 'delivery' || users.length === 0) {
    return NextResponse.json({ users })
  }

  const counts = await Order.aggregate([
    { $match: { assignedTo: { $in: users.map((u) => u._id) }, status: 'delivered' } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
  ])
  const countByUser = new Map(counts.map((c) => [String(c._id), c.count]))

  const usersWithCounts = users.map((u) => ({
    ...u,
    deliveryCount: countByUser.get(String(u._id)) ?? 0,
  }))

  return NextResponse.json({ users: usersWithCounts })
}
