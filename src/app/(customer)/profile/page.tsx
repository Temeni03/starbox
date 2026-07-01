'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { User, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadButton } from '@/lib/uploadthing-components'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [address, setAddress] = useState('')
  const [photo, setPhoto] = useState(session?.user?.image ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), address: address.trim(), profilePhoto: photo }),
      })
      if (!res.ok) throw new Error('Failed to save')
      await update({ name: name.trim() })
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

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full bg-neutral-100 overflow-hidden border-2 border-brand-light">
          {photo ? (
            <Image src={photo} alt="Profile" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
              <User size={36} />
            </div>
          )}
        </div>
        <UploadButton
          endpoint="profilePhoto"
          onClientUploadComplete={(res) => {
            if (res?.[0]) {
              setPhoto(res[0].ufsUrl)
              toast.success('Photo updated')
            }
          }}
          onUploadError={(err) => { toast.error(err.message) }}
          appearance={{ button: 'text-xs bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-secondary transition' }}
        />
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
            value={session?.user?.phone ?? ''}
            disabled
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Default delivery address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your address…"
            rows={2}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary resize-none transition"
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
