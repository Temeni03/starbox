import type { OrderStatus } from '@/models/Order'

const styles: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  transit:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const labels: Record<OrderStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  transit:   'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
