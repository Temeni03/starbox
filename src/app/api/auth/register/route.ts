import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { PHONE_REGEX } from '@/lib/phone'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { getRequestLocale } from '@/lib/localized'
import { translate } from '@/lib/serverTranslate'

const RegisterSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  phone: z.string().regex(PHONE_REGEX),
  password: z.string().min(6),
})

/**
 * These messages are rendered straight into the sign-up form, so they are returned already
 * translated for the caller's locale instead of as English validation text.
 */
const FIELD_ERROR_KEYS: Record<string, string> = {
  name: 'nameInvalid',
  phone: 'phoneInvalid',
  password: 'passwordTooShort',
}

export async function POST(req: Request) {
  const locale = await getRequestLocale()

  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      const field = String(parsed.error.errors[0]?.path[0] ?? '')
      const key = FIELD_ERROR_KEYS[field] ?? 'registrationFailed'
      return NextResponse.json({ error: await translate(locale, 'auth', key) }, { status: 400 })
    }

    const { name, phone, password } = parsed.data

    await connectDB()

    const existing = await User.findOne({ phone })
    if (existing) {
      return NextResponse.json(
        { error: await translate(locale, 'auth', 'phoneAlreadyRegistered') },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    await User.create({ name, phone, password: hashed, role: 'customer', language: locale })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: await translate(locale, 'auth', 'serverError') },
      { status: 500 }
    )
  }
}
