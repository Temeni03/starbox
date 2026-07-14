'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { User, Truck, Home, Bell } from 'lucide-react'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

export function DeliveryNav({ userName }: { userName: string }) {
  const t = useTranslations('deliveryNav')
  const pathname = usePathname()

  const links = [
    { href: '/delivery', label: t('home'), icon: Home, exact: true },
    { href: '/delivery/notifications', label: t('alerts'), icon: Bell },
    { href: '/delivery/profile', label: t('profile'), icon: User },
  ]

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-2xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-brand-primary" />
            <span className="text-xl font-bold text-brand-primary tracking-tight">{t('headerTitle')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher compact />
            <NotificationBell href="/delivery/notifications" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-light/50 text-brand-primary/70 hover:text-brand-primary transition hidden sm:inline-flex" />
            <Link
              href="/delivery/profile"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-primary transition"
            >
              <span className="hidden sm:block">{userName}</span>
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-neutral-200/60 z-40 sm:hidden safe-area-pb">
        <div className="grid grid-cols-3 h-16 px-2">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link key={href} href={href} className="flex items-center justify-center">
                <span
                  className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-full text-xs transition ${
                    active ? 'bg-brand-container text-brand-secondary' : 'text-neutral-400'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span>{label}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
