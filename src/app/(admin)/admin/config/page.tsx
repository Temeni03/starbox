'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminConfigPage() {
  const t = useTranslations('adminConfig')
  const { data, isLoading, mutate } = useSWR('/api/admin/config', fetcher)
  const [form, setForm] = useState({
    delivery_fee: '',
    bank_payment_code: '',
    low_stock_threshold: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.config) {
      setForm({
        delivery_fee: data.config.delivery_fee ?? '500',
        bank_payment_code: data.config.bank_payment_code ?? 'STORE-001',
        low_stock_threshold: data.config.low_stock_threshold ?? '10',
      })
    }
  }, [data])

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

  const fields = [
    {
      key: 'delivery_fee',
      label: t('deliveryFeeLabel'),
      type: 'number',
      hint: t('deliveryFeeHint'),
    },
    {
      key: 'bank_payment_code',
      label: t('bankCodeLabel'),
      type: 'text',
      hint: t('bankCodeHint'),
    },
    {
      key: 'low_stock_threshold',
      label: t('lowStockLabel'),
      type: 'number',
      hint: t('lowStockHint'),
    },
  ]

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-10 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 space-y-4">
          {fields.map(({ key, label, type, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
              <p className="text-xs text-neutral-400 mt-1">{hint}</p>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
          >
            {saving ? t('saving') : t('saveSettings')}
          </button>
        </form>
      )}
    </div>
  )
}
