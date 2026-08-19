'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AuthInput } from '@/components/ui/AuthInput'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' })
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
        <Image src="/logo.jpg" alt="Starbox" width={80} height={80} className="w-20 h-20 mb-4 rounded-full object-cover" priority />
        <h1 className="text-headline-xl text-brand-primary">Starbox</h1>
        <p className="text-body-md text-neutral-500 mt-1">Curated Luxury Shopping</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-3xl p-6 shadow-sm">
        <h2 className="text-headline-md text-neutral-800 mb-6">Join Starbox</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="name"
            name="name"
            label="Full name"
            icon="person"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ahmed Benali"
            required
            autoComplete="name"
          />

          <AuthInput
            id="phone"
            name="phone"
            label="Phone number"
            icon="call"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="2XXXXXXX"
            pattern="[234][0-9]{7}"
            maxLength={8}
            title="8 digits starting with 2, 3 or 4"
            required
            autoComplete="tel"
          />

          <AuthInput
            id="password"
            name="password"
            label="Password"
            icon="lock"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            minLength={6}
            required
            autoComplete="new-password"
            showPasswordLabel="Show password"
            hidePasswordLabel="Hide password"
          />

          <AuthInput
            id="confirm"
            name="confirm"
            label="Confirm password"
            icon="lock_reset"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={6}
            required
            autoComplete="new-password"
            showPasswordLabel="Show password"
            hidePasswordLabel="Hide password"
          />

          {error && (
            <p className="text-body-md text-danger bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand-primary text-white text-label-lg rounded-full shadow-md hover:bg-brand-secondary active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-body-md text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-primary text-label-lg">
            Sign In
          </Link>
        </p>
      </div>

      <p className="text-center text-label-sm text-neutral-400 mt-8">
        © {new Date().getFullYear()} Starbox. All rights reserved.
      </p>
    </div>
  )
}
