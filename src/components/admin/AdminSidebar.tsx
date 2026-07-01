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
  LogOut,
} from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/config', label: 'Settings', icon: Settings },
]

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-56 bg-brand-primary text-white flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-lg font-bold tracking-tight">StarBox</p>
          <p className="text-xs text-white/60 mt-0.5 truncate">{userName}</p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive(href, exact)
                  ? 'bg-white/20 font-semibold'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sm:hidden fixed top-0 inset-x-0 z-40 bg-brand-primary text-white h-14 flex items-center px-4 justify-between">
        <p className="font-bold">StarBox Admin</p>
        <div className="flex items-center gap-4">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={`transition ${isActive(href, exact) ? 'text-white' : 'text-white/60'}`}
            >
              <Icon size={20} />
            </Link>
          ))}
        </div>
      </header>

      {/* Mobile spacer */}
      <div className="sm:hidden h-14" />
    </>
  )
}
