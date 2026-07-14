'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { useNotifications } from '@/hooks/useNotifications'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

interface NavLinkDef {
  href: string
  labelKey: 'dashboard' | 'orders' | 'products' | 'boxes' | 'locations' | 'users' | 'notifications' | 'settings'
  icon: string
  exact?: boolean
}

const mainLinks: NavLinkDef[] = [
  { href: '/admin', labelKey: 'dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/orders', labelKey: 'orders', icon: 'shopping_bag' },
  { href: '/admin/products', labelKey: 'products', icon: 'package_2' },
  { href: '/admin/boxes', labelKey: 'boxes', icon: 'card_giftcard' },
  { href: '/admin/locations', labelKey: 'locations', icon: 'location_on' },
  { href: '/admin/users', labelKey: 'users', icon: 'group' },
]

const systemLinks: NavLinkDef[] = [
  { href: '/admin/notifications', labelKey: 'notifications', icon: 'notifications' },
  { href: '/admin/config', labelKey: 'settings', icon: 'settings' },
]

export function AdminSidebar({ userName }: { userName: string }) {
  const t = useTranslations('adminNav')
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  function NavLink({ href, labelKey, icon, exact }: NavLinkDef) {
    const active = isActive(href, exact)
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-lg transition ${
          active ? 'bg-brand-container text-brand-secondary font-semibold' : 'text-neutral-500 hover:bg-surface-high'
        }`}
      >
        <span className="relative">
          <Icon name={icon} size={18} filled={active} />
          {labelKey === 'notifications' && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        {t(labelKey)}
      </Link>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 bg-white border-r border-neutral-200 flex-col shrink-0">
        <div className="px-6 py-5 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-md shrink-0"
            />
            <div>
              <p className="text-headline-lg text-brand-primary tracking-tight leading-none">Starbox</p>
              <p className="text-label-sm text-neutral-400 mt-1">{t('tagline')}</p>
            </div>
          </div>
          <LocaleSwitcher compact />
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <div className="pt-4 mt-4 border-t border-neutral-100">
            <p className="px-4 mb-2 text-label-sm uppercase tracking-wider text-neutral-400">System</p>
            <div className="space-y-1">
              {systemLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>
        </nav>

        <div className="m-3 p-3 bg-surface-low rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-container flex items-center justify-center text-brand-secondary shrink-0">
            <Icon name="person" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-lg font-semibold text-neutral-800 truncate">{userName}</p>
            <p className="text-label-sm text-neutral-400 truncate">{t('administrator')}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-neutral-400 hover:text-danger transition"
            aria-label={t('signOutAria')}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sm:hidden fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/60 h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="rounded-md shrink-0"
          />
          <span className="text-headline-lg text-brand-primary tracking-tight leading-none">Starbox</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={t('openMenuAria')}
          aria-expanded={mobileOpen}
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-neutral-500 hover:bg-surface-high transition"
        >
          <Icon name="menu" size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 end-1 w-2.5 h-2.5 rounded-full bg-danger border-2 border-white" />
          )}
        </button>
      </header>

      {/* Mobile spacer */}
      <div className="sm:hidden h-14" />

      {/* Mobile drawer */}
      <div
        className={`sm:hidden fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`sm:hidden fixed inset-y-0 start-0 z-50 w-72 max-w-[85%] bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className="px-6 py-5 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-md shrink-0"
            />
            <div>
              <p className="text-headline-lg text-brand-primary tracking-tight leading-none">Starbox</p>
              <p className="text-label-sm text-neutral-400 mt-1">{t('tagline')}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label={t('closeMenuAria')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:bg-surface-high transition"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <div className="pt-4 mt-4 border-t border-neutral-100">
            <p className="px-4 mb-2 text-label-sm uppercase tracking-wider text-neutral-400">System</p>
            <div className="space-y-1">
              {systemLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>
        </nav>

        <div className="px-3 pb-3">
          <LocaleSwitcher />
        </div>

        <div className="m-3 mt-0 p-3 bg-surface-low rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-container flex items-center justify-center text-brand-secondary shrink-0">
            <Icon name="person" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-lg font-semibold text-neutral-800 truncate">{userName}</p>
            <p className="text-label-sm text-neutral-400 truncate">{t('administrator')}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-neutral-400 hover:text-danger transition"
            aria-label={t('signOutAria')}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
    </>
  )
}
