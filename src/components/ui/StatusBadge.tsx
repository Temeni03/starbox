import { useTranslations } from 'next-intl'
import { Clock3, BadgeCheck, Truck, CircleCheckBig, CircleX } from 'lucide-react'
import type { OrderStatus } from '@/models/Order'

const styles: Record<OrderStatus, string> = {
  pending:   'bg-status-pending/15 text-status-pending',
  confirmed: 'bg-status-confirmed/15 text-status-confirmed',
  transit:   'bg-status-transit/15 text-status-transit',
  delivered: 'bg-status-delivered/15 text-status-delivered',
  cancelled: 'bg-status-cancelled/15 text-status-cancelled',
}

const icons: Record<OrderStatus, typeof Clock3> = {
  pending: Clock3,
  confirmed: BadgeCheck,
  transit: Truck,
  delivered: CircleCheckBig,
  cancelled: CircleX,
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('status')
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      <Icon size={14} />
      {t(status)}
    </span>
  )
}
