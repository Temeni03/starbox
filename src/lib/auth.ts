import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null

        await connectDB()
        const user = await User.findOne({
          phone: credentials.phone,
          isActive: true,
        }).lean()

        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        )
        if (!valid) return null

        return {
          id: user._id.toString(),
          name: user.name as string,
          phone: user.phone as string,
          role: user.role as 'customer' | 'admin' | 'delivery',
        }
      },
    }),
  ],
})
