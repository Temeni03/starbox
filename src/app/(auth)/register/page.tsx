'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-primary">StarBox</h1>
          <p className="text-neutral-500 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Ahmed Benali"
              required
              autoComplete="name"
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="0612345678"
              required
              autoComplete="tel"
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-secondary disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-secondary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
