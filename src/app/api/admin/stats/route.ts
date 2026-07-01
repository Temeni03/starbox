import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    ordersToday,
    revenueTodayAgg,
    pendingOrders,
    totalOrders,
    totalRevenueAgg,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({}),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }),
  ])

  return NextResponse.json({
    ordersToday,
    revenueToday: revenueTodayAgg[0]?.total ?? 0,
    pendingOrders,
    totalOrders,
    totalRevenue: totalRevenueAgg[0]?.total ?? 0,
    lowStockProducts,
  })
}
