import useSWR, { useSWRConfig } from 'swr'
import type { NotificationParams } from '@/lib/notificationParams'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const isNotificationsKey = (key: unknown): key is string =>
  typeof key === 'string' && key.startsWith('/api/notifications')

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
  const { mutate: mutateAll } = useSWRConfig()
  const { data, isLoading } = useSWR(
    `/api/notifications?limit=${limit}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    mutateAll(isNotificationsKey)
  }

  async function markAllAsRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    })
    mutateAll(isNotificationsKey)
  }

  return {
    notifications: (data?.notifications ?? []) as AppNotification[],
    unreadCount: (data?.unreadCount ?? 0) as number,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}
