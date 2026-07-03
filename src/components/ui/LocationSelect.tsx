'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { useDeliveryLocations, type DeliveryLocation } from '@/hooks/useDeliveryLocations'

interface LocationSelectProps {
  value: DeliveryLocation | null
  onChange: (location: DeliveryLocation) => void
}

export function LocationSelect({ value, onChange }: LocationSelectProps) {
  const { locations, isLoading } = useDeliveryLocations()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = locations.filter((loc) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return loc.nameFr.toLowerCase().includes(q) || loc.nameAr.includes(query.trim())
  })

  function handleSelect(loc: DeliveryLocation) {
    onChange(loc)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-secondary bg-white"
      >
        <MapPin size={16} className="text-neutral-400 flex-shrink-0" />
        {value ? (
          <span className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <span className="truncate text-neutral-700">
              {value.nameFr} <span dir="rtl">— {value.nameAr}</span>
            </span>
            <span className="text-xs text-neutral-500 flex-shrink-0">
              {value.price.toLocaleString()} MRU
            </span>
          </span>
        ) : (
          <span className="text-neutral-400">Select your delivery location…</span>
        )}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100">
            <Search size={14} className="text-neutral-400 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location…"
              className="flex-1 text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {isLoading && (
              <p className="px-3 py-3 text-sm text-neutral-400">Loading locations…</p>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="px-3 py-3 text-sm text-neutral-400">No location found</p>
            )}
            {filtered.map((loc) => (
              <button
                key={loc._id}
                type="button"
                onClick={() => handleSelect(loc)}
                className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-left text-sm hover:bg-brand-light transition ${
                  value?._id === loc._id ? 'bg-brand-light' : ''
                }`}
              >
                <span className="truncate text-neutral-700">
                  {loc.nameFr} <span dir="rtl" className="text-neutral-500">— {loc.nameAr}</span>
                </span>
                <span className="text-xs text-neutral-500 flex-shrink-0">
                  {loc.price.toLocaleString()} MRU
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
