import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { notifyUser, notifyRole } from '@/lib/notify'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'customer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  await connectDB()

  const order = await Order.findOne({ _id: id, customer: session.user.id })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (order.status !== 'transit') {
    return NextResponse.json(
      { error: `Cannot confirm receipt from status ${order.status}` },
      { status: 400 }
    )
  }

  const receivedAt = new Date()
  order.status = 'delivered'
  order.receivedAt = receivedAt
  order.statusHistory.push({
    status: 'delivered',
    changedAt: receivedAt,
    changedBy: session.user.id as any,
  })
  await order.save()

  if (order.assignedTo) {
    notifyUser(order.assignedTo.toString(), {
      type: 'delivery_confirmed',
      params: { orderNumber: order.orderNumber },
      url: `/delivery/orders/${order._id}`,
    }).catch(() => {})
  }
  notifyRole('admin', {
    type: 'delivery_confirmed',
    params: { orderNumber: order.orderNumber },
    url: `/admin/orders/${order._id}`,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
