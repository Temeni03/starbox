'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Phone, Lock, KeyRound, Gem } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Registration failed.')
        return
      }

      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch {
      setError('Something went wrong. Please try again.')
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
        <h2 className="text-xl font-semibold text-neutral-800 mb-6">Join Starbox</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-medium text-neutral-500 ml-1">
              Full name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Ahmed Benali"
                required
                autoComplete="name"
                className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-xs font-medium text-neutral-500 ml-1">
              Phone number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="2XXXXXXX"
                pattern="[234][0-9]{7}"
                maxLength={8}
                title="8 digits starting with 2, 3 or 4"
                required
                autoComplete="tel"
                className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-medium text-neutral-500 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                minLength={6}
                required
                autoComplete="new-password"
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

          <div className="space-y-1">
            <label htmlFor="confirm" className="block text-xs font-medium text-neutral-500 ml-1">
              Confirm password
            </label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                required
                autoComplete="new-password"
                className="w-full h-12 pl-12 pr-12 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(prev => !prev)}
                tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-primary"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
            className="w-full h-12 bg-brand-primary text-white font-semibold text-sm rounded-xl shadow-md hover:bg-brand-secondary active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-primary font-bold">
            Sign In
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-8">
        © {new Date().getFullYear()} Starbox. All rights reserved.
      </p>
    </div>
  )
}
