import { create } from 'zustand'

export interface CartItem {
  product: string
  itemType: 'product' | 'box'
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartStore {
  items: CartItem[]
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
  totalCount: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.product === item.product)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product === item.product
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      return { items: [...state.items, item] }
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product === productId ? { ...i, quantity } : i
      ),
    })),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product !== productId),
    })),

  clear: () => set({ items: [] }),

  totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
