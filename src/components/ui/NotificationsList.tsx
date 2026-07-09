'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useNotifications, type AppNotification } from '@/hooks/useNotifications'

function timeAgo(dateStr: string, locale: string, t: ReturnType<typeof useTranslations<'notifications'>>) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return t('justNow')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('minutesAgo', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('hoursAgo', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('daysAgo', { count: days })
  return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function NotificationRow({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const locale = useLocale()
  const t = useTranslations('notifications')
  const content = (
    <div className={`flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-brand-light/30'}`}>
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-brand-primary'}`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${n.read ? 'text-neutral-600' : 'font-semibold text-neutral-800'}`}>
          {n.title}
        </p>
        <p className="text-sm text-neutral-500 mt-0.5">{n.body}</p>
        <p className="text-xs text-neutral-400 mt-1">{timeAgo(n.createdAt, locale, t)}</p>
      </div>
    </div>
  )

  function handleClick() {
    if (!n.read) onRead(n._id)
  }

  if (n.url) {
    return (
      <Link href={n.url} onClick={handleClick} className="block hover:bg-brand-light/50 transition">
        {content}
      </Link>
    )
  }
  return (
    <button onClick={handleClick} className="block w-full text-left hover:bg-brand-light/50 transition">
      {content}
    </button>
  )
}

export function NotificationsList() {
  const t = useTranslations('notifications')
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm font-medium text-brand-primary hover:underline">
            {t('markAllRead')}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3 animate-pulse space-y-2">
                <div className="h-4 bg-neutral-100 rounded w-2/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Bell size={40} className="mb-3 text-brand-primary/40" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notifications.map((n) => (
              <NotificationRow key={n._id} n={n} onRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
