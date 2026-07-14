import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import type { OrderStatus } from '@/models/Order'

const styles: Record<OrderStatus, string> = {
  pending:   'bg-status-pending/15 text-status-pending',
  confirmed: 'bg-status-confirmed/15 text-status-confirmed',
  transit:   'bg-status-transit/15 text-status-transit',
  delivered: 'bg-status-delivered/15 text-status-delivered',
  cancelled: 'bg-status-cancelled/15 text-status-cancelled',
}

const icons: Record<OrderStatus, string> = {
  pending: 'schedule',
  confirmed: 'verified',
  transit: 'local_shipping',
  delivered: 'check_circle',
  cancelled: 'cancel',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('status')
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm ${styles[status]}`}>
      <Icon name={icons[status]} size={14} />
      {t(status)}
    </span>
  )
}
