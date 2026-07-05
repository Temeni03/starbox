'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Phone, Lock, Gem } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        phone: phone.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid phone number or password.')
        return
      }

      const session = await getSession()
      const role = session?.user?.role

      if (callbackUrl) {
        router.push(callbackUrl)
      } else if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'delivery') {
        router.push('/delivery')
      } else {
        router.push('/')
      }

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-4 rounded-3xl bg-linear-to-br from-brand-primary to-brand-container flex items-center justify-center shadow-lg border-4 border-white">
          <Gem size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-brand-primary tracking-tight">Starbox</h1>
        <p className="text-sm text-neutral-500 mt-1">Curated Luxury Shopping</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-3xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-medium text-neutral-500 ml-1">
              Phone number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0612345678"
                required
                autoComplete="tel"
                className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-neutral-500 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-12 pl-12 pr-12 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand-primary text-white font-semibold text-sm rounded-xl shadow-md hover:bg-brand-secondary active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-primary font-bold">
            Create Account
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-8">
        © {new Date().getFullYear()} Starbox. All rights reserved.
      </p>
    </div>
  )
}
