'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Bell,
  LogOut,
  MapPin,
  User as UserIcon,
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

interface NavLinkDef {
  href: string
  label: string
  icon: typeof LayoutDashboard
  exact?: boolean
}

const mainLinks: NavLinkDef[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/users', label: 'Users', icon: Users },
]

const systemLinks: NavLinkDef[] = [
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/config', label: 'Settings', icon: Settings },
]

const links = [...mainLinks, ...systemLinks]

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  function NavLink({ href, label, icon: Icon, exact }: (typeof links)[number]) {
    const active = isActive(href, exact)
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
          active ? 'bg-brand-container text-brand-secondary font-semibold' : 'text-neutral-500 hover:bg-surface-high'
        }`}
      >
        <span className="relative">
          <Icon size={18} />
          {label === 'Notifications' && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        {label}
      </Link>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 bg-white border-r border-neutral-200 flex-col shrink-0">
        <div className="px-6 py-5">
          <p className="text-xl font-bold text-brand-primary tracking-tight">Starbox</p>
          <p className="text-xs text-neutral-400 mt-0.5">Curated Luxury Admin</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <div className="pt-4 mt-4 border-t border-neutral-100">
            <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">System</p>
            <div className="space-y-1">
              {systemLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>
        </nav>

        <div className="m-3 p-3 bg-surface-low rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-container flex items-center justify-center text-brand-secondary shrink-0">
            <UserIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-800 truncate">{userName}</p>
            <p className="text-xs text-neutral-400 truncate">Administrator</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-neutral-400 hover:text-danger transition"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sm:hidden fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/60 h-14 flex items-center px-4 justify-between">
        <p className="font-bold text-brand-primary">Starbox Admin</p>
        <div className="flex items-center gap-4">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={`relative transition ${isActive(href, exact) ? 'text-brand-primary' : 'text-neutral-400'}`}
            >
              <Icon size={20} />
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </header>

      {/* Mobile spacer */}
      <div className="sm:hidden h-14" />
    </>
  )
}
