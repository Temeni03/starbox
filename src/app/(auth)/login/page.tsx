'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Eye, EyeOff, Phone, Lock } from 'lucide-react'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { isRtl, type Locale } from '@/i18n/config'

export default function LoginPage() {
  const t = useTranslations('auth')
  const dir = isRtl(useLocale() as Locale) ? 'rtl' : 'ltr'
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
        setError(t('invalidCredentials'))
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
      <div className="flex justify-end mb-2">
        <LocaleSwitcher />
      </div>

      <div className="flex flex-col items-center mb-8">
        <Image src="/logo.png" alt="Starbox" width={80} height={80} className="w-20 h-20 mb-4 object-contain" priority />
        <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Starbox</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('tagline')}</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-3xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6">{t('welcomeBack')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-medium text-neutral-500 ms-1">
              {t('phoneLabel')}
            </label>
            <div className="relative">
              <Phone size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="phone"
                type="tel"
                dir={dir}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                required
                autoComplete="tel"
                className="w-full h-12 ps-12 pe-4 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-neutral-500 ms-1">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                dir={dir}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-12 ps-12 pe-12 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                tabIndex={-1}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-primary"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
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
            className="w-full h-12 bg-brand-primary text-white font-semibold text-sm rounded-full shadow-md hover:bg-brand-secondary active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-brand-primary font-bold">
            {t('createAccount')}
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-8">
        {t('copyright', { year: new Date().getFullYear() })}
      </p>
    </div>
  )
}
