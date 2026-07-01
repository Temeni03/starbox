import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'
import { User } from '@/models/User'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const [
    totalOrders,
    totalProducts,
    totalDeliverers,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments({}),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'delivery' }),
    Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }),
  ])

  return NextResponse.json({
    totalOrders,
    totalProducts,
    totalDeliverers,
    lowStockProducts,
  })
}
