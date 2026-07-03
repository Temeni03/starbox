import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Location } from '@/models/Location'

const LocationSchema = z.object({
  nameAr: z.string().min(1).trim(),
  nameFr: z.string().min(1).trim(),
  price: z.number().min(0),
  isActive: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const locations = await Location.find({}).sort({ nameFr: 1 }).lean()
  return NextResponse.json({ locations })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = LocationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()
  const location = await Location.create(parsed.data)
  return NextResponse.json({ location }, { status: 201 })
}
