'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { AuthInput } from '@/components/ui/AuthInput'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const t = useTranslations('auth')
  // The phone rule is already worded once for the profile screen - reuse it rather than
  // maintaining a second copy of the same sentence.
  const tProfile = useTranslations('profile')
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
      setError(t('passwordsMismatch'))
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
        setError(data.error ?? t('registrationFailed'))
        return
      }

      toast.success(t('accountCreated'))
      router.push('/login')
    } catch {
      setError(t('genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col">
      <div className="flex justify-end mb-2">
        <LocaleSwitcher />
      </div>

      <div className="flex flex-col items-center mb-8">
        <Image src="/logo.jpg" alt="Starbox" width={80} height={80} className="w-20 h-20 mb-4 rounded-full object-cover" priority />
        <h1 className="text-headline-xl text-brand-primary">Starbox</h1>
        <p className="text-body-md text-neutral-500 mt-1">{t('tagline')}</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-3xl p-6 shadow-sm">
        <h2 className="text-headline-md text-neutral-800 mb-6">{t('joinTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="name"
            name="name"
            label={t('fullNameLabel')}
            icon="person"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder={t('fullNamePlaceholder')}
            required
            autoComplete="name"
          />

          <AuthInput
            id="phone"
            name="phone"
            label={t('phoneLabel')}
            icon="call"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="2XXXXXXX"
            pattern="[234][0-9]{7}"
            maxLength={8}
            title={tProfile('phoneHint')}
            required
            autoComplete="tel"
          />

          <AuthInput
            id="password"
            name="password"
            label={t('passwordLabel')}
            icon="lock"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('passwordPlaceholder')}
            minLength={6}
            required
            autoComplete="new-password"
            showPasswordLabel={t('showPassword')}
            hidePasswordLabel={t('hidePassword')}
          />

          <AuthInput
            id="confirm"
            name="confirm"
            label={t('confirmPasswordLabel')}
            icon="lock_reset"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            minLength={6}
            required
            autoComplete="new-password"
            showPasswordLabel={t('showPassword')}
            hidePasswordLabel={t('hidePassword')}
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
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <p className="text-center text-body-md text-neutral-500 mt-6">
          {t('haveAccount')}{' '}
          <Link href="/login" className="text-brand-primary text-label-lg">
            {t('signIn')}
          </Link>
        </p>
      </div>

      <p className="text-center text-label-sm text-neutral-400 mt-8">
        {t('copyright', { year: new Date().getFullYear() })}
      </p>
    </div>
  )
}
