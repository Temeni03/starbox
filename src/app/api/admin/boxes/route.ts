import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Box } from '@/models/Box'
import { localizedNameSchema } from '@/lib/localizedSchema'

const BoxProductSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().int().min(1),
})

const BoxSchema = z
  .object({
    name: localizedNameSchema,
    price: z.number().min(0),
    coverImage: z.string().url().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    products: z.array(BoxProductSchema).min(1, 'Select at least one product'),
    isActive: z.boolean().optional(),
  })
  .refine((v) => new Set(v.products.map((p) => p.product)).size === v.products.length, {
    message: 'Each product can only be added once per box',
    path: ['products'],
  })
  .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  })

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const boxes = await Box.find({})
    .sort({ createdAt: -1 })
    .populate('products.product', 'name images')
    .lean()

  return NextResponse.json({ boxes })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = BoxSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()
  const box = await Box.create(parsed.data)
  return NextResponse.json({ box }, { status: 201 })
}
