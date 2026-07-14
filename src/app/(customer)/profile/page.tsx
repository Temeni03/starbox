'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import Image from 'next/image'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'
import { isRtl, localeNames, type Locale } from '@/i18n/config'
import { setUserLocale } from '@/i18n/actions'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LANGUAGES: Locale[] = ['ar', 'fr', 'en']

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const tNotifications = useTranslations('notifications')
  const locale = useLocale() as Locale
  const fieldDir = isRtl(locale) ? 'rtl' : 'ltr'
  const router = useRouter()
  const [, startTransition] = useTransition()
  const { data: session, update } = useSession()
  const { data: profileData } = useSWR('/api/profile', fetcher)
  const [name, setName] = useState(session?.user?.name ?? '')
  const [phone, setPhone] = useState(session?.user?.phone ?? '')
  const [language, setLanguage] = useState<Locale>('fr')
  const [saving, setSaving] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const [showFullPhoto, setShowFullPhoto] = useState(false)

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
      await mutate('/api/profile')
      toast.success(t('photoUpdated'))
    } catch {
      toast.error(t('updatePhotoError'))
    }
  }

  async function handleRemovePhoto() {
    if (!profileData?.profilePhoto) return
    setRemovingPhoto(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto: null }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t('updatePhotoError'))
        return
      }
      await mutate('/api/profile')
      toast.success(t('photoRemoved'))
    } catch {
      toast.error(t('updatePhotoError'))
    } finally {
      setRemovingPhoto(false)
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
    { href: '/orders', label: t('myOrders'), icon: 'receipt_long' },
    { href: '/notifications', label: tNotifications('title'), icon: 'notifications' },
  ]

  return (
    <div className="pb-24 sm:pb-6 max-w-sm mx-auto">
      {/* Hero */}
      <section className="mb-8 text-center">
        <div className="relative inline-block mb-4">
          <div
            role={profileData?.profilePhoto ? 'button' : undefined}
            tabIndex={profileData?.profilePhoto ? 0 : undefined}
            aria-label={profileData?.profilePhoto ? t('viewPhotoAria') : undefined}
            onClick={() => profileData?.profilePhoto && setShowFullPhoto(true)}
            onKeyDown={(e) => {
              if (profileData?.profilePhoto && (e.key === 'Enter' || e.key === ' ')) setShowFullPhoto(true)
            }}
            className={`w-24 h-24 rounded-full border-4 border-brand-container overflow-hidden mx-auto shadow-lg bg-brand-light flex items-center justify-center ${
              profileData?.profilePhoto ? 'cursor-pointer' : ''
            }`}
          >
            {profileData?.profilePhoto ? (
              <Image src={profileData.profilePhoto} alt={name} fill className="object-cover" sizes="96px" />
            ) : (
              <Icon name="person" size={36} className="text-brand-primary" />
            )}
          </div>
        </div>
        <h2 className="text-headline-md text-neutral-800">{session?.user?.name}</h2>
        <p className="text-body-md text-neutral-500 mb-3">{session?.user?.phone}</p>
        <div className="flex justify-center items-center gap-2">
          <ImageUploadButton type="profilePhoto" label={t('changePhoto')} onUploaded={handlePhotoUploaded} />
          {profileData?.profilePhoto && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={removingPhoto}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-danger/20 text-label-lg text-danger hover:bg-red-50 disabled:opacity-60 transition"
            >
              <Icon name="delete" size={16} />
              {removingPhoto ? t('removingPhoto') : t('removePhoto')}
            </button>
          )}
        </div>
      </section>

      {showFullPhoto && profileData?.profilePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setShowFullPhoto(false)}
        >
          <button
            type="button"
            onClick={() => setShowFullPhoto(false)}
            aria-label={tCommon('close')}
            className="absolute top-4 inset-e-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <Icon name="close" size={22} />
          </button>
          <div
            className="relative w-full max-w-sm aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={profileData.profilePhoto}
              alt={name}
              fill
              className="object-contain rounded-2xl"
              sizes="384px"
            />
          </div>
        </div>
      )}

      {/* Editable details */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 mb-4">
        <div>
          <label className="block text-label-sm text-neutral-500 mb-1">{t('fullName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir={fieldDir}
            className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md text-start focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
        </div>

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
            className={`w-full h-12 px-4 border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition ${
              fieldDir === 'rtl' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 flex items-center justify-center bg-brand-primary text-white rounded-xl text-label-lg hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4">
        <label className="block text-label-sm text-neutral-500 mb-1">{tCommon('language')}</label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleLanguageSelect(value)}
              className={`px-3 py-2 rounded-lg text-label-lg border transition ${
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
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full h-12 flex items-center justify-center gap-2 border-2 border-danger/20 text-danger rounded-full text-label-lg hover:bg-red-50 transition"
      >
        <Icon name="logout" size={18} className="rtl:rotate-180" />
        {t('logout')}
      </button>
    </div>
  )
}
