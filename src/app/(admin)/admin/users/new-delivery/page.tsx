'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewDeliveryPage() {
  const t = useTranslations('adminNewDelivery')
  const tProfile = useTranslations('profile')
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
        setError(data.error ?? t('createError'))
        return
      }
      toast.success(t('accountCreated'))
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm space-y-4">
      <Link href="/admin/users" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> {t('back')}
      </Link>
      <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 space-y-4">
        {[
          { name: 'name', label: t('fullName'), type: 'text', placeholder: 'Karim Benali' },
          { name: 'phone', label: t('phoneNumber'), type: 'tel', placeholder: '2XXXXXXX', pattern: '[234][0-9]{7}', maxLength: 8, title: tProfile('phoneHint') },
          { name: 'password', label: t('password'), type: 'password', placeholder: t('passwordPlaceholder'), minLength: 6 },
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
              className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
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
          className="w-full h-12 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {loading ? t('creating') : t('createAccount')}
        </button>
      </form>
    </div>
  )
}
