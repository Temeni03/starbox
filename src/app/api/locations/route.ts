import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Location } from '@/models/Location'

export async function GET() {
  try {
    await connectDB()

    const locations = await Location.find({ isActive: true })
      .select('nameAr nameFr price')
      .sort({ nameFr: 1 })
      .lean()

    return NextResponse.json({ locations })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch delivery locations' }, { status: 500 })
  }
}
