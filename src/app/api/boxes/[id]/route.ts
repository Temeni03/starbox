import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Box } from '@/models/Box'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'
import { activeBoxFilter } from '@/lib/boxAvailability'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const locale = await getRequestLocale()

    const box = await Box.findOne({ _id: id, ...activeBoxFilter() })
      .populate('products.product', 'name price images')
      .lean<{
        _id: unknown
        name: Record<string, string | undefined>
        price: number
        coverImage?: string
        products: {
          product: { _id: unknown; name: Record<string, string | undefined>; price: number; images: string[] } | null
          quantity: number
        }[]
      }>()

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 })
    }

    const products = box.products
      .filter((bp) => bp.product)
      .map((bp) => ({
        _id: bp.product!._id,
        name: resolveLocalized(bp.product!.name, locale),
        price: bp.product!.price,
        images: bp.product!.images,
        quantity: bp.quantity,
      }))

    return NextResponse.json({
      box: {
        _id: box._id,
        name: resolveLocalized(box.name, locale),
        price: box.price,
        coverImage: box.coverImage,
        products,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch box' }, { status: 500 })
  }
}
