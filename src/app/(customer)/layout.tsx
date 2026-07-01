import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CustomerNav } from '@/components/customer/CustomerNav'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'customer') {
    if (session.user.role === 'admin') redirect('/admin')
    if (session.user.role === 'delivery') redirect('/delivery')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <CustomerNav userName={session.user.name} />
      <main className="flex-1 container mx-auto px-4 py-4 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
