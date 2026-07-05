'use client'

import { useState } from 'react'
import { Search, Package, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
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
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (e.target.value === '') setQuery('')
          }}
          placeholder="Search curated luxury…"
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-200 bg-surface-low text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
        />
      </form>

      {/* Featured banner */}
      <section className="mb-8 relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container">
        <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent flex flex-col justify-center p-6 sm:p-8">
          <span className="text-brand-light text-xs font-semibold tracking-wider uppercase mb-2">
            Limited Edition
          </span>
          <h2 className="text-white text-2xl sm:text-3xl font-bold max-w-xs leading-tight mb-4">
            The Summer Glow Collection
          </h2>
          <button
            type="button"
            className="bg-white text-brand-primary w-max px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transition-shadow"
          >
            Shop Collection
          </button>
        </div>
      </section>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="aspect-[4/5] rounded-2xl bg-surface-high mb-3" />
              <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface-high rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="relative text-center py-12 px-4">
          <div className="relative inline-block mb-8">
            <div className="w-48 h-48 mx-auto rounded-full bg-white/60 backdrop-blur-md border border-brand-light flex items-center justify-center shadow-sm">
              <Package size={64} className="text-brand-primary/40" />
              <div className="absolute -top-2 -right-2 bg-white p-3 rounded-2xl shadow-md border border-brand-light">
                <Search size={24} className="text-brand-primary" />
              </div>
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-brand-container/40 blur-xl" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">
            {query ? 'No products found' : 'No products available yet'}
          </h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
            {query
              ? "We couldn't find any matches for your search. Try checking your spelling or browse the full catalog instead."
              : 'Check back soon — new arrivals are on the way.'}
          </p>
          {query && (
            <button
              onClick={() => { setSearch(''); setQuery('') }}
              className="mt-6 inline-flex items-center gap-2 bg-brand-primary text-white px-8 h-12 rounded-full text-sm font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary active:scale-95 transition-all"
            >
              <ShoppingBag size={16} />
              Return to Shop
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      )}

    </div>
  )
}
