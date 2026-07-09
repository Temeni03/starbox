import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface DeliveryLocation {
  _id: string
  name: string
  price: number
}

export function useDeliveryLocations() {
  const { data, error, isLoading } = useSWR('/api/locations', fetcher)

  return {
    locations: (data?.locations ?? []) as DeliveryLocation[],
    isLoading,
    error,
  }
}
