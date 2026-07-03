import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { notifyUser, notifyRole } from '@/lib/notify'

const ALLOWED_TRANSITIONS: Record<string, string> = {
  confirmed: 'transit',
  transit: 'delivered',
}

const StatusSchema = z.object({
  status: z.enum(['transit', 'delivered']),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'delivery') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await connectDB()

  const order = await Order.findOne({ _id: id, assignedTo: session.user.id })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const allowed = ALLOWED_TRANSITIONS[order.status]
  if (allowed !== parsed.data.status) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.status} to ${parsed.data.status}` },
      { status: 400 }
    )
  }

  order.status = parsed.data.status
  order.statusHistory.push({
    status: parsed.data.status,
    changedAt: new Date(),
    changedBy: session.user.id as any,
  })
  await order.save()

  if (parsed.data.status === 'transit') {
    notifyUser(order.customer.toString(), {
      type: 'order_transit',
      title: 'StarBox — Order on its way',
      body: `Your order ${order.orderNumber} is on its way.`,
      url: `/orders/${order._id}`,
    }).catch(() => {})
  } else if (parsed.data.status === 'delivered') {
    notifyUser(order.customer.toString(), {
      type: 'order_delivered',
      title: 'StarBox — Order delivered',
      body: `Your order ${order.orderNumber} has been delivered.`,
      url: `/orders/${order._id}`,
    }).catch(() => {})
    notifyRole('admin', {
      type: 'delivery_confirmed',
      title: 'StarBox — Delivery confirmed',
      body: `Order ${order.orderNumber} was marked as delivered by the delivery person.`,
      url: `/admin/orders/${order._id}`,
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
