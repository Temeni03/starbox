import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { notifyUser } from '@/lib/notify'

const StatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'transit', 'delivered', 'cancelled']),
  note: z.string().trim().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()

  const order = await Order.findById(id)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  order.status = parsed.data.status
  order.statusHistory.push({
    status: parsed.data.status,
    changedAt: new Date(),
    changedBy: session.user.id as any,
    note: parsed.data.note,
  })
  await order.save()

  const { status, note } = parsed.data

  if (status === 'confirmed') {
    notifyUser(order.customer.toString(), {
      type: 'order_confirmed',
      params: { orderNumber: order.orderNumber },
      url: `/orders/${order._id}`,
    }).catch(() => {})
  } else if (status === 'cancelled') {
    notifyUser(order.customer.toString(), {
      type: 'order_cancelled',
      params: note ? { orderNumber: order.orderNumber, reason: note } : { orderNumber: order.orderNumber },
      url: `/orders/${order._id}`,
    }).catch(() => {})
  } else if (status === 'transit') {
    notifyUser(order.customer.toString(), {
      type: 'order_transit',
      params: { orderNumber: order.orderNumber },
      url: `/orders/${order._id}`,
    }).catch(() => {})
  } else if (status === 'delivered') {
    notifyUser(order.customer.toString(), {
      type: 'order_delivered',
      params: { orderNumber: order.orderNumber },
      url: `/orders/${order._id}`,
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
