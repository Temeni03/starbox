import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Location } from '@/models/Location'
import { localizedNameSchema } from '@/lib/localizedSchema'

const UpdateSchema = z.object({
  name: localizedNameSchema.optional(),
  price: z.number().min(0).optional(),
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
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()
  const location = await Location.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  return NextResponse.json({ location })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const location = await Location.findByIdAndDelete(id)
  if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
