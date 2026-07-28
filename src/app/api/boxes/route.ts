import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Box } from '@/models/Box'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'
import { activeBoxFilter, isBoxOutOfStock } from '@/lib/boxAvailability'

export async function GET() {
  try {
    await connectDB()
    const locale = await getRequestLocale()

    const boxes = await Box.find(activeBoxFilter())
      .select('name price coverImage products')
      .populate('products.product', 'quantity')
      .sort({ createdAt: -1 })
      .lean()

    const localizedBoxes = boxes.map((b) => ({
      _id: b._id,
      name: resolveLocalized(b.name, locale),
      price: b.price,
      coverImage: b.coverImage,
      outOfStock: isBoxOutOfStock(b.products as { product?: { quantity: number } | null }[]),
    }))

    return NextResponse.json({ boxes: localizedBoxes })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch boxes' }, { status: 500 })
  }
}
