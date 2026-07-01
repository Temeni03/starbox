import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  price: z.number().min(0).optional(),
  description: z.string().trim().optional(),
  images: z.array(z.string()).optional(),
  quantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
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
  const product = await Product.findById(id).lean()
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
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
  const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  return NextResponse.json({ product })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  await Product.findByIdAndUpdate(id, { isActive: false })
  return NextResponse.json({ success: true })
}
