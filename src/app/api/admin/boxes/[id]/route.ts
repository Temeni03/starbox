import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Box } from '@/models/Box'
import { localizedNameSchema } from '@/lib/localizedSchema'
import { deleteBlobs } from '@/lib/blob'

const BoxProductSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().int().min(1),
})

const UpdateSchema = z
  .object({
    name: localizedNameSchema.optional(),
    price: z.number().min(0).optional(),
    coverImage: z.string().url().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    products: z.array(BoxProductSchema).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (v) => !v.products || new Set(v.products.map((p) => p.product)).size === v.products.length,
    { message: 'Each product can only be added once per box', path: ['products'] }
  )
  .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  })

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await connectDB()
  const box = await Box.findById(id).populate('products.product', 'name price images').lean()
  if (!box) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ box })
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
  const box = await Box.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!box) return NextResponse.json({ error: 'Box not found' }, { status: 404 })

  return NextResponse.json({ box })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const box = await Box.findByIdAndDelete(id)
  if (!box) return NextResponse.json({ error: 'Box not found' }, { status: 404 })

  await deleteBlobs([box.coverImage])

  return NextResponse.json({ success: true })
}
