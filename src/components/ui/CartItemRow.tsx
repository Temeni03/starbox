'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'

interface Props {
  image?: string
  name: string
  price: number
  quantity: number
  href?: string
  onIncrement?: () => void
  onDecrement?: () => void
  onRemove?: () => void
  removeAriaLabel?: string
}

export function CartItemRow({
  image,
  name,
  price,
  quantity,
  href,
  onIncrement,
  onDecrement,
  onRemove,
  removeAriaLabel,
}: Props) {
  const content = (
    <>
      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-high flex-shrink-0">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <Icon name="package_2" size={20} />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-body-lg font-semibold text-neutral-800 truncate">{name}</h3>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-neutral-400 hover:text-danger transition flex-shrink-0"
              aria-label={removeAriaLabel}
            >
              <Icon name="delete" size={18} />
            </button>
          )}
        </div>

        <div className="flex justify-between items-end mt-2">
          <span className="text-body-lg font-bold text-brand-primary">
            {price.toLocaleString()} MRU
          </span>
          {onIncrement || onDecrement ? (
            <div className="flex items-center bg-surface-high rounded-full p-1 border border-neutral-200">
              <button
                onClick={onDecrement}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white active:scale-90 transition"
              >
                <Icon name="remove" size={14} />
              </button>
              <span className="w-8 text-center text-label-lg">{quantity}</span>
              <button
                onClick={onIncrement}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white active:scale-90 transition"
              >
                <Icon name="add" size={14} />
              </button>
            </div>
          ) : (
            <span className="text-label-lg text-neutral-500">× {quantity}</span>
          )}
        </div>
      </div>
    </>
  )

  const className = 'bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl p-4 flex gap-4'

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
