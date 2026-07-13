import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface Box {
  _id: string
  name: string
  price: number
  coverImage?: string
}

export function useBoxes() {
  const { data, error, isLoading } = useSWR('/api/boxes', fetcher)

  return {
    boxes: (data?.boxes ?? []) as Box[],
    isLoading,
    error,
  }
}
