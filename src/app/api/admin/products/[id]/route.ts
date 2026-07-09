import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { notifyRole } from '@/lib/notify'
import { localizedNameSchema, localizedTextSchema } from '@/lib/localizedSchema'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'

const UpdateSchema = z.object({
  name: localizedNameSchema.optional(),
  price: z.number().min(0).optional(),
  description: localizedTextSchema.optional(),
  usageInstructions: localizedTextSchema.optional(),
  images: z.array(z.string()).optional(),
  video: z.string().optional(),
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
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()
  const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  if (
    parsed.data.quantity !== undefined &&
    product.isActive &&
    product.quantity <= product.lowStockThreshold
  ) {
    const locale = await getRequestLocale()
    notifyRole('admin', {
      type: 'low_stock',
      title: 'StarBox — Low stock',
      body: `"${resolveLocalized(product.name, locale)}" is running low (${product.quantity} left).`,
      url: `/admin/products`,
    }, session.user.id).catch(() => {})
  }

  return NextResponse.json({ product })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const product = await Product.findByIdAndDelete(id)
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
