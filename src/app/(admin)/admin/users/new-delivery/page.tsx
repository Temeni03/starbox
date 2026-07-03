'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewDeliveryPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create account')
        return
      }
      toast.success('Delivery account created')
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm space-y-4">
      <Link href="/admin/users" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold text-neutral-800">Add Delivery Staff</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        {[
          { name: 'name', label: 'Full name', type: 'text', placeholder: 'Karim Benali' },
          { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '2XXXXXXX', pattern: '[234][0-9]{7}', maxLength: 8, title: '8 digits starting with 2, 3 or 4' },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', minLength: 6 },
        ].map(({ name, label, type, placeholder, pattern, maxLength, minLength, title }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
            <input
              name={name}
              type={type}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              placeholder={placeholder}
              pattern={pattern}
              maxLength={maxLength}
              minLength={minLength}
              title={title}
              required
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
        ))}

        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
