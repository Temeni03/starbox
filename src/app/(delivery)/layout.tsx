import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DeliveryNav } from '@/components/delivery/DeliveryNav'

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'delivery') redirect('/login')

  return (
    <div className="min-h-screen bg-surface-low flex flex-col">
      <DeliveryNav userName={session.user.name} />
      <main className="flex-1 container mx-auto px-4 py-4 pb-24 sm:pb-4 max-w-2xl">{children}</main>
    </div>
  )
}
