import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { AppConfig } from '@/models/AppConfig'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const configs = await AppConfig.find({}).lean()
  const map = Object.fromEntries(configs.map((c) => [c.key, c.value]))
  return NextResponse.json({ config: map })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  await connectDB()

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      AppConfig.findOneAndUpdate(
        { key },
        { value: String(value) },
        { upsert: true, new: true }
      )
    )
  )

  return NextResponse.json({ success: true })
}
