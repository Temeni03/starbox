import useSWR from 'swr'
import type { NotificationParams } from '@/lib/notificationParams'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface AppNotification {
  _id: string
  type: string
  title: string
  body: string
  url?: string
  data?: NotificationParams
  read: boolean
  createdAt: string
}

export function useNotifications(limit = 30) {
  const { data, isLoading, mutate } = useSWR(
    `/api/notifications?limit=${limit}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    mutate()
  }

  async function markAllAsRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    })
    mutate()
  }

  return {
    notifications: (data?.notifications ?? []) as AppNotification[],
    unreadCount: (data?.unreadCount ?? 0) as number,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}
