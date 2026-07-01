# AUTH.md — Authentication Architecture
## Delivery Management Web Application

---

## Overview

Using **NextAuth v5 (Auth.js)** with the Credentials provider and JWT strategy.

---

## Setup

### 1. Install

```bash
npm install next-auth@beta
```

### 2. Core Auth Config

**File:** `src/lib/auth.ts`

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
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
          isActive: true 
        }).select('+password')
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null
        
        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.phone = token.phone as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
```

### 3. Type Augmentation

**File:** `src/types/next-auth.d.ts`

```ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role: 'customer' | 'admin' | 'delivery'
    phone: string
  }
  interface Session {
    user: {
      id: string
      name: string
      role: 'customer' | 'admin' | 'delivery'
      phone: string
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'customer' | 'admin' | 'delivery'
    phone: string
  }
}
```

### 4. API Handler

**File:** `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

### 5. Middleware (Route Protection)

**File:** `src/middleware.ts`

```ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes — no auth required
  const publicRoutes = ['/', '/login', '/register', '/api/auth', '/api/products']
  const isPublic = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublic) return NextResponse.next()

  // No session — redirect to login
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = session.user.role

  // Admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (role !== 'admin') return NextResponse.redirect(new URL('/', req.url))
  }

  // Delivery routes
  if (pathname.startsWith('/delivery') || pathname.startsWith('/api/delivery')) {
    if (role !== 'delivery') return NextResponse.redirect(new URL('/', req.url))
  }

  // Customer-only routes
  const customerRoutes = ['/checkout', '/orders', '/cart', '/profile']
  if (customerRoutes.some(r => pathname.startsWith(r))) {
    if (role !== 'customer') return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}
```

---

## Usage in Server Components

```ts
import { auth } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/login')
  
  // Use session.user.id, session.user.role, etc.
}
```

## Usage in API Routes

```ts
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  // ...
}
```

---

## Password Hashing

Always use bcrypt with cost factor 12:

```ts
import bcrypt from 'bcryptjs'

// Hash (registration)
const hashedPassword = await bcrypt.hash(plainPassword, 12)

// Verify (login — handled by NextAuth authorize callback above)
const isValid = await bcrypt.compare(plainPassword, hashedPassword)
```

---

## Role-Based Access Summary

| Path | Required Role | Notes |
|------|--------------|-------|
| `/` | None | Public product browse |
| `/login` `/register` | None | Redirect to home if already logged in |
| `/cart` | customer | |
| `/checkout` | customer | |
| `/orders/*` | customer | Own orders only |
| `/profile` | customer | |
| `/admin/*` | admin | All admin pages |
| `/delivery/*` | delivery | Own deliveries only |
| `/api/auth/*` | None | NextAuth handlers |
| `/api/products` GET | None | Public read |
| `/api/products` POST/PUT/DELETE | admin | |
| `/api/cart/*` | customer | |
| `/api/orders` POST | customer | |
| `/api/orders` GET | customer or admin | Scoped by role |
| `/api/orders/[id]/approve` | admin | |
| `/api/orders/[id]/assign` | admin | |
| `/api/orders/[id]/status` | admin or delivery | Delivery limited to "delivered" |
| `/api/admin/*` | admin | |
| `/api/delivery/*` | delivery | |
| `/api/inventory/*` | admin | |
| `/api/delivery-personnel/*` | admin | |
