import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') ?? 'customer'

  await connectDB()

  const users = await User.find({ role })
    .select('name phone address isActive createdAt')
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json({ users })
}
