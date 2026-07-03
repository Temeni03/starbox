'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
] as const

export default function DeliveryProfilePage() {
  const { data: session, update } = useSession()
  const { data: profileData, mutate } = useSWR('/api/profile', fetcher)

  const [name, setName] = useState(session?.user?.name ?? '')
  const [phone, setPhone] = useState(session?.user?.phone ?? '')
  const [language, setLanguage] = useState<'ar' | 'fr' | 'en'>('fr')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profileData?.language) setLanguage(profileData.language)
  }, [profileData?.language])

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
        toast.error(data.error ?? 'Failed to update profile')
        return
      }
      await update({ name: name.trim(), phone: phone.trim() })
      mutate()
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24 sm:pb-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold text-neutral-800">Profile</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[234][0-9]{7}"
            maxLength={8}
            title="8 digits starting with 2, 3 or 4"
            required
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Language</label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLanguage(value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  language === value
                    ? 'border-brand-primary bg-brand-light text-brand-primary'
                    : 'border-neutral-200 text-neutral-600 hover:border-brand-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-200 text-danger py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )
}
