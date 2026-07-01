import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { sendPushToUser } from '@/lib/webpush'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { deliveryPersonId } = await req.json()

  await connectDB()

  const delivery = await User.findOne({ _id: deliveryPersonId, role: 'delivery', isActive: true })
  if (!delivery) {
    return NextResponse.json({ error: 'Delivery person not found' }, { status: 404 })
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { assignedTo: deliveryPersonId },
    { new: true }
  )
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  sendPushToUser(deliveryPersonId, {
    title: 'StarBox — New Delivery',
    body: `Order ${order.orderNumber} has been assigned to you.`,
    url: `/delivery/orders/${order._id}`,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
