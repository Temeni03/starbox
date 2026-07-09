'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationBell({ href, className = '' }: { href: string; className?: string }) {
  const t = useTranslations('notifications')
  const { unreadCount } = useNotifications()

  return (
    <Link href={href} title={t('title')} className={className}>
      <span className="relative inline-flex">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </span>
    </Link>
  )
}
