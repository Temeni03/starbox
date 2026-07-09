import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
    const skip = (page - 1) * limit

    await connectDB()
    const locale = await getRequestLocale()

    const filter: Record<string, unknown> = { isActive: true }
    if (search) {
      filter.$text = { $search: search }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name price description images quantity lowStockThreshold')
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ])

    const localizedProducts = products.map((p) => ({
      ...p,
      name: resolveLocalized(p.name, locale),
      description: p.description ? resolveLocalized(p.description, locale) : undefined,
    }))

    return NextResponse.json({
      products: localizedProducts,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
