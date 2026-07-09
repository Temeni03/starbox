import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Location } from '@/models/Location'
import { getRequestLocale, resolveLocalized } from '@/lib/localized'

export async function GET() {
  try {
    await connectDB()
    const locale = await getRequestLocale()

    const locations = await Location.find({ isActive: true })
      .select('name price')
      .sort({ 'name.fr': 1, 'name.ar': 1, 'name.en': 1 })
      .lean()

    const localizedLocations = locations.map((l) => ({
      ...l,
      name: resolveLocalized(l.name, locale),
    }))

    return NextResponse.json({ locations: localizedLocations })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch delivery locations' }, { status: 500 })
  }
}
