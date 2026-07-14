'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

export function DeliveryNav({ userName }: { userName: string }) {
  const t = useTranslations('deliveryNav')
  const pathname = usePathname()

  const links = [
    { href: '/delivery', label: t('home'), icon: 'home', exact: true },
    { href: '/delivery/notifications', label: t('alerts'), icon: 'notifications' },
    { href: '/delivery/profile', label: t('profile'), icon: 'person' },
  ]

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-2xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-md shrink-0"
            />
            <span className="text-headline-lg text-brand-primary tracking-tight leading-none">
              Starbox
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell href="/delivery/notifications" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-light/50 text-brand-primary/70 hover:text-brand-primary transition hidden sm:inline-flex" />
            <LocaleSwitcher compact />
          </div>
        </div>
      </header>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-neutral-200/60 z-40 sm:hidden safe-area-pb">
        <div className="grid grid-cols-3 h-16 px-2">
          {links.map(({ href, label, icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link key={href} href={href} className="flex items-center justify-center">
                <span
                  className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-full text-label-sm transition ${
                    active ? 'text-brand-primary' : 'text-neutral-400'
                  }`}
                >
                  <Icon name={icon} size={22} filled={active} />
                  <span className="whitespace-nowrap">{label}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
