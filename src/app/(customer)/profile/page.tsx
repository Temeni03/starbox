'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LogOut, User as UserIcon, ClipboardList, Bell, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const tNotifications = useTranslations('notifications')
  const { data: session, update } = useSession()
  const { data: profileData } = useSWR('/api/profile', fetcher)
  const [name, setName] = useState(session?.user?.name ?? '')
  const [phone, setPhone] = useState(session?.user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  async function handlePhotoUploaded(urls: string[]) {
    const url = urls[0]
    if (!url) return
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto: url }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t('updatePhotoError'))
        return
      }
      await mutate('/api/profile')
      toast.success(t('photoUpdated'))
    } catch {
      toast.error(t('updatePhotoError'))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t('updateError'))
        return
      }
      await update({ name: name.trim(), phone: phone.trim() })
      toast.success(t('updated'))
    } catch {
      toast.error(t('updateError'))
    } finally {
      setSaving(false)
    }
  }

  const navItems = [
    { href: '/orders', label: t('myOrders'), icon: ClipboardList },
    { href: '/notifications', label: tNotifications('title'), icon: Bell },
  ]

  return (
    <div className="pb-24 sm:pb-6 max-w-sm mx-auto">
      {/* Hero */}
      <section className="mb-8 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-brand-container overflow-hidden mx-auto shadow-lg bg-brand-light flex items-center justify-center">
            {profileData?.profilePhoto ? (
              <Image src={profileData.profilePhoto} alt={name} fill className="object-cover" sizes="96px" />
            ) : (
              <UserIcon size={36} className="text-brand-primary" />
            )}
          </div>
        </div>
        <h2 className="text-xl font-bold text-neutral-800">{session?.user?.name}</h2>
        <p className="text-sm text-neutral-500 mb-3">{session?.user?.phone}</p>
        <div className="flex justify-center">
          <ImageUploadButton type="profilePhoto" label={t('changePhoto')} onUploaded={handlePhotoUploaded} />
        </div>
      </section>

      {/* Editable details */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">{t('fullName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">{t('phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[234][0-9]{7}"
            maxLength={8}
            title={t('phoneHint')}
            required
            className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 flex items-center justify-center bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">{tCommon('language')}</span>
        <LocaleSwitcher />
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full h-12 flex items-center justify-center gap-2 border-2 border-danger/20 text-danger rounded-full font-semibold text-sm hover:bg-red-50 transition"
      >
        <LogOut size={18} />
        {t('logout')}
      </button>
    </div>
  )
}
