'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id: string
  label: string
  /** Material Symbols name for the leading icon (e.g. `lock`, `call`, `person`). */
  icon: string
  type?: React.HTMLInputTypeAttribute
  /** aria-labels for the password reveal toggle; only used when `type="password"`. */
  showPasswordLabel?: string
  hidePasswordLabel?: string
}

/**
 * The single labelled input used by the login and sign-up forms: leading icon, optional password
 * reveal toggle, shared spacing.
 *
 * Direction handling — both icons are positioned with logical offsets (`start-*` / `end-*`) on
 * plain wrapper elements that inherit the page direction, so they mirror with `dir="rtl"` on
 * <html> and stay 12px+ clear of each other in both directions. The icon glyph is never the
 * positioned element: Material Symbols is bidi-isolated, and anything that pins its own
 * direction resolves logical offsets against that direction instead of the page's.
 */
export function AuthInput({
  id,
  label,
  icon,
  type = 'text',
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
  className = '',
  ...inputProps
}: AuthInputProps) {
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-label-sm text-neutral-500 ms-1">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 flex items-center text-neutral-400">
          <Icon name={icon} size={18} />
        </span>
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          className={`w-full h-12 ps-12 ${isPassword ? 'pe-12' : 'pe-4'} bg-white border border-neutral-200 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition ${className}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            tabIndex={-1}
            className="absolute end-4 top-1/2 -translate-y-1/2 flex items-center text-neutral-400 hover:text-brand-primary"
            aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
          >
            <Icon name={revealed ? 'visibility_off' : 'visibility'} size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
