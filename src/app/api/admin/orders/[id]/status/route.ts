import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { sendPushToUser } from '@/lib/webpush'

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

  const statusLabels: Record<string, string> = {
    confirmed: 'confirmed',
    transit: 'on its way',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }
  const label = statusLabels[parsed.data.status]
  if (label) {
    sendPushToUser(order.customer.toString(), {
      title: 'StarBox — Order Update',
      body: `Your order ${order.orderNumber} has been ${label}.`,
      url: `/orders/${order._id}`,
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
