import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const locale = await getRequestLocale()

    const product = await Product.findOne({ _id: id, isActive: true })
      .select('name price description usageInstructions weight images video quantity lowStockThreshold')
      .lean<{
        name: Record<string, string | undefined>
        description?: Record<string, string | undefined>
        usageInstructions?: Record<string, string | undefined>
        [key: string]: unknown
      }>()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...product,
        name: resolveLocalized(product.name, locale),
        description: product.description ? resolveLocalized(product.description, locale) : undefined,
        usageInstructions: product.usageInstructions
          ? resolveLocalized(product.usageInstructions, locale)
          : undefined,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
