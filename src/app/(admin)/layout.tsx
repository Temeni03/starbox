import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen w-full max-w-full bg-surface-low flex">
      <AdminSidebar userName={session.user.name} />
      {/* min-w-0 lets this column shrink below its content's intrinsic width, so wide children
          (tables, long unbroken strings) scroll inside their own box instead of stretching the row. */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* pt-[4.5rem] on mobile clears the fixed h-14 top bar (56px) plus the usual 16px page gutter;
            from `sm` up the top bar is gone and the sidebar takes over, so normal padding applies. */}
        <main className="flex-1 w-full min-w-0 max-w-full px-4 pt-[4.5rem] pb-6 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
