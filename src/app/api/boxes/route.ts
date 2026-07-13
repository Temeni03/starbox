import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Box } from '@/models/Box'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'
import { activeBoxFilter } from '@/lib/boxAvailability'

export async function GET() {
  try {
    await connectDB()
    const locale = await getRequestLocale()

    const boxes = await Box.find(activeBoxFilter())
      .select('name price coverImage')
      .sort({ createdAt: -1 })
      .lean()

    const localizedBoxes = boxes.map((b) => ({
      ...b,
      name: resolveLocalized(b.name, locale),
    }))

    return NextResponse.json({ boxes: localizedBoxes })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch boxes' }, { status: 500 })
  }
}
