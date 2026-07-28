import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { AppConfig } from '@/models/AppConfig'

export async function GET() {
  await connectDB()
  const config = await AppConfig.findOne({ key: 'bank_payment_code' }).lean()
  return NextResponse.json({
    bank_payment_code: config?.value ?? 'STORE-001',
  })
}
