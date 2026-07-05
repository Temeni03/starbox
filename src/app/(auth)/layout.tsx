export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-surface-low px-4 py-12 overflow-hidden">
      <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-brand-container/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-72 h-72 rounded-full bg-brand-container/15 blur-3xl pointer-events-none" />
      {children}
    </div>
  )
}
