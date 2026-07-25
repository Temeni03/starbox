'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminConfigPage() {
  const t = useTranslations('adminConfig')
  const { data: session, update } = useSession()
  const { data, isLoading, mutate } = useSWR('/api/admin/config', fetcher)
  const [form, setForm] = useState({
    bank_payment_code: '',
  })
  const [saving, setSaving] = useState(false)

  const [phone, setPhone] = useState('')
  const [savingPhone, setSavingPhone] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (data?.config) {
      setForm({
        bank_payment_code: data.config.bank_payment_code ?? 'STORE-001',
      })
    }
  }, [data])

  useEffect(() => {
    setPhone(session?.user?.phone ?? '')
  }, [session?.user?.phone])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(t('settingsSaved'))
      mutate()
    } catch {
      toast.error(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingPhone(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const resData = await res.json()
      if (!res.ok) {
        toast.error(resData.error ?? t('phoneUpdateError'))
        return
      }
      await update({ phone: phone.trim() })
      toast.success(t('phoneUpdated'))
    } catch {
      toast.error(t('phoneUpdateError'))
    } finally {
      setSavingPhone(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error(t('passwordTooShort'))
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t('passwordMismatch'))
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const resData = await res.json()
      if (!res.ok) {
        toast.error(resData.error ?? t('passwordUpdateError'))
        return
      }
      toast.success(t('passwordUpdated'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch {
      toast.error(t('passwordUpdateError'))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-headline-lg-mobile md:text-headline-lg text-neutral-800">{t('title')}</h1>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-100 rounded w-1/3" />
            <div className="h-10 bg-neutral-100 rounded" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-label-sm text-neutral-500 mb-1">{t('bankCodeLabel')}</label>
            <input
              type="text"
              value={form.bank_payment_code}
              onChange={(e) => setForm((prev) => ({ ...prev, bank_payment_code: e.target.value }))}
              className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
            <p className="text-label-sm text-neutral-400 mt-1">{t('bankCodeHint')}</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-brand-primary text-white rounded-xl text-label-lg hover:bg-brand-secondary disabled:opacity-60 transition"
          >
            {saving ? t('saving') : t('saveSettings')}
          </button>
        </form>
      )}

      {/* Account Information */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5">
        <h2 className="text-headline-md text-neutral-800">{t('accountInfo')}</h2>

        <form onSubmit={handlePhoneSubmit} className="space-y-3">
          <div>
            <label className="block text-label-sm text-neutral-500 mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="[234][0-9]{7}"
              maxLength={8}
              title={t('phoneHint')}
              required
              dir="ltr"
              className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
            <p className="text-label-sm text-neutral-400 mt-1">{t('phoneHint')}</p>
          </div>
          <button
            type="submit"
            disabled={savingPhone}
            className="w-full h-12 bg-brand-primary text-white rounded-xl text-label-lg hover:bg-brand-secondary disabled:opacity-60 transition"
          >
            {savingPhone ? t('saving') : t('savePhone')}
          </button>
        </form>

        <div className="border-t border-neutral-100 pt-4">
          <h3 className="text-label-lg font-medium text-neutral-700 mb-3">{t('changePassword')}</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-label-sm text-neutral-500 mb-1">{t('currentPassword')}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-label-sm text-neutral-500 mb-1">{t('newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-label-sm text-neutral-500 mb-1">{t('confirmNewPassword')}</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full h-12 bg-brand-primary text-white rounded-xl text-label-lg hover:bg-brand-secondary disabled:opacity-60 transition"
            >
              {savingPassword ? t('saving') : t('savePassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
