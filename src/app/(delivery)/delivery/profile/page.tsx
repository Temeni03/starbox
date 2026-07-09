'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LogOut, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'
import { localeNames, type Locale } from '@/i18n/config'
import { setUserLocale } from '@/i18n/actions'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LANGUAGES: Locale[] = ['ar', 'fr', 'en']

export default function DeliveryProfilePage() {
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [, startTransition] = useTransition()
  const { data: session, update } = useSession()
  const { data: profileData, mutate } = useSWR('/api/profile', fetcher)

  const [name, setName] = useState(session?.user?.name ?? '')
  const [phone, setPhone] = useState(session?.user?.phone ?? '')
  const [language, setLanguage] = useState<Locale>('fr')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profileData?.language) setLanguage(profileData.language)
  }, [profileData?.language])

  function handleLanguageSelect(value: Locale) {
    setLanguage(value)
    startTransition(async () => {
      await setUserLocale(value)
      router.refresh()
    })
  }

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
      mutate()
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
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), language }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t('updateError'))
        return
      }
      await update({ name: name.trim(), phone: phone.trim() })
      mutate()
      toast.success(t('updated'))
    } catch {
      toast.error(t('updateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-6 max-w-sm mx-auto">
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

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('fullName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{t('phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[234][0-9]{7}"
            maxLength={8}
            title={t('phoneHint')}
            required
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{tCommon('language')}</label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleLanguageSelect(value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  language === value
                    ? 'border-brand-primary bg-brand-light text-brand-primary'
                    : 'border-neutral-200 text-neutral-600 hover:border-brand-primary'
                }`}
              >
                {localeNames[value]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full h-12 flex items-center justify-center gap-2 border-2 border-danger/20 text-danger rounded-full font-semibold text-sm hover:bg-red-50 transition"
      >
        <LogOut size={16} />
        {t('logout')}
      </button>
    </div>
  )
}
