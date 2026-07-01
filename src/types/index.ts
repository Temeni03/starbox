export type UserRole = 'customer' | 'admin' | 'delivery'

export type OrderStatus = 'pending' | 'confirmed' | 'transit' | 'delivered' | 'cancelled'
export type DeliveryOption = 'home' | 'pickup'
export type PaymentMethod = 'cash' | 'bank_transfer'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
