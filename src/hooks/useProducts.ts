import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface Product {
  _id: string
  name: string
  price: number
  description?: string
  images: string[]
  quantity: number
  lowStockThreshold: number
}

export function useProducts(search = '', page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) params.set('search', search)

  const { data, error, isLoading } = useSWR(`/api/products?${params}`, fetcher)

  return {
    products: (data?.products ?? []) as Product[],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    isLoading,
    error,
  }
}
