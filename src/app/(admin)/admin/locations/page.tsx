'use client'

import { useMemo, useState } from 'react'
import { Plus, Pencil, EyeOff, Eye, Trash2, Search, MapPin, AlertTriangle, X } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface LocationRecord {
  _id: string
  nameAr: string
  nameFr: string
  price: number
  isActive: boolean
}

interface FormState {
  nameAr: string
  nameFr: string
  price: string
}

const EMPTY_FORM: FormState = { nameAr: '', nameFr: '', price: '' }

export default function AdminLocationsPage() {
  const { data, isLoading, mutate } = useSWR('/api/admin/locations', fetcher)
  const locations: LocationRecord[] = data?.locations ?? []

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<LocationRecord | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<LocationRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return locations
    return locations.filter(
      (l) => l.nameFr.toLowerCase().includes(q) || l.nameAr.includes(search.trim())
    )
  }, [locations, search])

  function openAddForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(location: LocationRecord) {
    setEditing(location)
    setForm({ nameAr: location.nameAr, nameFr: location.nameFr, price: String(location.price) })
    setShowForm(true)
  }

  async function handleSubmit() {
    const nameAr = form.nameAr.trim()
    const nameFr = form.nameFr.trim()
    const price = Number(form.price)

    if (!nameAr || !nameFr) {
      toast.error('Please fill in both names')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(
        editing ? `/api/admin/locations/${editing._id}` : '/api/admin/locations',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameAr, nameFr, price }),
        }
      )
      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error ?? 'Failed to save location')

      mutate()
      toast.success(editing ? 'Location updated' : 'Location added')
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(location: LocationRecord) {
    try {
      await fetch(`/api/admin/locations/${location._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !location.isActive }),
      })
      mutate()
      toast.success(location.isActive ? 'Location hidden' : 'Location activated')
    } catch {
      toast.error('Failed to update location')
    }
  }

  async function deleteLocation() {
    if (!locationToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/locations/${locationToDelete._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      mutate()
      toast.success('Location deleted')
      setLocationToDelete(null)
    } catch {
      toast.error('Failed to delete location')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Delivery Locations</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition"
        >
          <Plus size={16} />
          Add Location
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a location by name…"
          className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : locations.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">No delivery locations yet</p>
        ) : filteredLocations.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">No location matches &quot;{search}&quot;</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredLocations.map((l) => (
              <div key={l._id} className={`flex items-center gap-4 px-5 py-3 ${!l.isActive ? 'opacity-50' : ''}`}>
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-400">
                  <MapPin size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {l.nameFr} <span dir="rtl" className="text-neutral-500">— {l.nameAr}</span>
                    </p>
                    {!l.isActive && <span className="text-xs text-neutral-400">Hidden</span>}
                  </div>
                  <p className="text-xs text-neutral-400">{l.price.toLocaleString()} MRU</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditForm(l)}
                    className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => toggleActive(l)}
                    className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition"
                    title={l.isActive ? 'Hide' : 'Show'}
                  >
                    {l.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => setLocationToDelete(l)}
                    className="p-2 text-neutral-400 hover:text-danger hover:bg-neutral-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-800">
                {editing ? 'Edit Location' : 'Add Location'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Name (French)
                </label>
                <input
                  type="text"
                  value={form.nameFr}
                  onChange={(e) => setForm((f) => ({ ...f, nameFr: e.target.value }))}
                  placeholder="e.g. Ksar"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.nameAr}
                  onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                  placeholder="مثال: الكصر"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Delivery Price (MRU)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 150"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition disabled:opacity-50"
              >
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {locationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">Delete location</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-neutral-700">{locationToDelete.nameFr}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLocationToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteLocation}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
