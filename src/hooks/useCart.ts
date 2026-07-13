import useSWR from 'swr'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import type { CartItem } from '@/store/cartStore'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR('/api/cart', fetcher)
  const setItems = useCartStore((s) => s.setItems)
  const addItem = useCartStore((s) => s.addItem)
  const clear = useCartStore((s) => s.clear)

  useEffect(() => {
    if (data?.cart?.items) {
      const items: CartItem[] = data.cart.items.map((i: any) => ({
        product: String(i.product),
        itemType: i.itemType === 'Box' ? 'box' : 'product',
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      }))
      setItems(items)
    }
  }, [data, setItems])

  async function addToCart(
    itemId: string,
    quantity = 1,
    item?: Omit<CartItem, 'product' | 'quantity' | 'itemType'> & { itemType?: CartItem['itemType'] }
  ) {
    const itemType = item?.itemType ?? 'product'
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemType, quantity }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? 'Failed to add to cart')
    }
    if (item) {
      addItem({ product: itemId, quantity, ...item, itemType })
    }
    mutate()
  }

  async function updateQuantity(itemId: string, quantity: number) {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) throw new Error('Failed to update quantity')
    mutate()
  }

  async function removeFromCart(itemId: string) {
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
    mutate()
  }

  async function clearCart() {
    const res = await fetch('/api/cart', { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to clear cart')
    clear()
    mutate()
  }

  return { cart: data?.cart, isLoading, error, addToCart, updateQuantity, removeFromCart, clearCart, mutate }
}
