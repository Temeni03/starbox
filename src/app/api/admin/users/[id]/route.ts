import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'

const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().regex(/^[234][0-9]{7}$/, 'Phone must be 8 digits starting with 2, 3 or 4').optional(),
  address: z.string().trim().optional(),
  isActive: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()

  if (parsed.data.phone) {
    const existing = await User.findOne({ phone: parsed.data.phone, _id: { $ne: id } })
    if (existing) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 409 })
    }
  }

  const user = await User.findByIdAndUpdate(id, parsed.data, { new: true })
    .select('name phone address isActive role createdAt')
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ user })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()

  const activeDeliveries = await Order.countDocuments({
    assignedTo: id,
    status: { $in: ['confirmed', 'transit'] },
  })
  if (activeDeliveries > 0) {
    return NextResponse.json(
      { error: 'Cannot delete: this delivery person has active deliveries' },
      { status: 409 }
    )
  }

  const user = await User.findByIdAndDelete(id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
