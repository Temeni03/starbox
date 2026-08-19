import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { presenceCutoff, PRESENCE_WINDOW_MINUTES } from '@/lib/presence'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') ?? 'customer'

  await connectDB()

  const users = await User.find({ role })
    .select('name phone address isActive createdAt profilePhoto lastActiveAt')
    .sort({ createdAt: -1 })
    .lean()

  // "Active now" is presence, not account status: users whose client sent a heartbeat inside the
  // presence window. `isActive` (account enabled) defaults to true for everyone, which is why
  // counting it client-side always mirrored the total.
  const activeCount = await User.countDocuments({
    role,
    lastActiveAt: { $gte: presenceCutoff() },
  })

  const meta = {
    total: users.length,
    activeCount,
    presenceWindowMinutes: PRESENCE_WINDOW_MINUTES,
  }

  if (role !== 'delivery' || users.length === 0) {
    return NextResponse.json({ users, ...meta })
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

  return NextResponse.json({ users: usersWithCounts, ...meta })
}
