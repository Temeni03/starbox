import useSWR from 'swr'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import type { CartItem } from '@/store/cartStore'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR('/api/cart', fetcher)
  const setItems = useCartStore((s) => s.setItems)

  useEffect(() => {
    if (data?.cart?.items) {
      const items: CartItem[] = data.cart.items.map((i: any) => ({
        product: i.product?._id ?? i.product,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image ?? i.product?.images?.[0],
      }))
      setItems(items)
    }
  }, [data, setItems])

  async function addToCart(productId: string, quantity = 1) {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? 'Failed to add to cart')
    }
    mutate()
  }

  async function updateQuantity(productId: string, quantity: number) {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) throw new Error('Failed to update quantity')
    mutate()
  }

  async function removeFromCart(productId: string) {
    await fetch(`/api/cart/${productId}`, { method: 'DELETE' })
    mutate()
  }

  return { cart: data?.cart, isLoading, error, addToCart, updateQuantity, removeFromCart, mutate }
}
