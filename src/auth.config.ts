import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt' },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isPublic =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/products') ||
        pathname.startsWith('/api/locations')

      if (isPublic) return true
      if (!isLoggedIn) return false

      const role = (auth!.user as any).role

      if (
        (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
        role !== 'admin'
      ) {
        return Response.redirect(new URL('/', nextUrl))
      }

      if (
        (pathname.startsWith('/delivery') || pathname.startsWith('/api/delivery')) &&
        role !== 'delivery'
      ) {
        return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },

    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role
        token.phone = (user as any).phone
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.phone) token.phone = session.phone
      }
      return token
    },

    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'customer' | 'admin' | 'delivery'
      session.user.phone = token.phone as string
      return session
    },
  },

  providers: [],
}
