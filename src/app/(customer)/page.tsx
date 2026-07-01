'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { ProductCard } from '@/components/ui/ProductCard'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const { products, isLoading } = useProducts(query)
  const { addToCart } = useCart()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(search.trim())
  }

  return (
    <div className="pb-20 sm:pb-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (e.target.value === '') setQuery('')
          }}
          placeholder="Search products…"
          className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary transition"
        />
      </form>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-neutral-100" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-100 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg">No products found</p>
          {query && (
            <button
              onClick={() => { setSearch(''); setQuery('') }}
              className="mt-2 text-sm text-brand-secondary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
