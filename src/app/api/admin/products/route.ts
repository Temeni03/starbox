import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { localizedNameSchema, localizedTextSchema } from '@/lib/localizedSchema'

const ProductSchema = z.object({
  name: localizedNameSchema,
  price: z.number().min(0),
  description: localizedTextSchema.optional(),
  usageInstructions: localizedTextSchema.optional(),
  weight: z.string().trim().max(50).optional(),
  images: z.array(z.string().url()).optional(),
  video: z.string().url().optional(),
  quantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 30
  const skip = (page - 1) * limit

  await connectDB()

  const [products, total] = await Promise.all([
    Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments({}),
  ])

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()
  const product = await Product.create(parsed.data)
  return NextResponse.json({ product }, { status: 201 })
}
