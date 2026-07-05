'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, User as UserIcon, ClipboardList, Bell, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
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
        toast.error(data.error ?? 'Failed to update photo')
        return
      }
      await mutate('/api/profile')
      toast.success('Profile photo updated')
    } catch {
      toast.error('Failed to update photo')
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
        toast.error(data.error ?? 'Failed to update profile')
        return
      }
      await update({ name: name.trim(), phone: phone.trim() })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const navItems = [
    { href: '/orders', label: 'My Orders', icon: ClipboardList },
    { href: '/notifications', label: 'Notifications', icon: Bell },
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
          <ImageUploadButton type="profilePhoto" label="Change photo" onUploaded={handlePhotoUploaded} />
        </div>
      </section>

      {/* Editable details */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
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
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

    

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full h-12 flex items-center justify-center gap-2 border-2 border-danger/20 text-danger rounded-full font-semibold text-sm hover:bg-red-50 transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  )
}
