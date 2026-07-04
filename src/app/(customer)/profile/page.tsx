'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { LogOut, User as UserIcon } from 'lucide-react'
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

  return (
    <div className="pb-24 sm:pb-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold text-neutral-800 flex justify-center">Profile</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full bg-brand-light border border-neutral-200 overflow-hidden flex items-center justify-center">
          {profileData?.profilePhoto ? (
            <Image src={profileData.profilePhoto} alt={name} fill className="object-cover" sizes="96px" />
          ) : (
            <UserIcon size={40} className="text-brand-primary" />
          )}
        </div>
        <ImageUploadButton type="profilePhoto" label="Change photo" onUploaded={handlePhotoUploaded} />
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
