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
