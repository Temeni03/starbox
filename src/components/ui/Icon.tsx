export function Icon({
  name,
  size = 24,
  filled = false,
  weight = 400,
  className = '',
}: {
  name: string
  size?: number
  filled?: boolean
  weight?: number
  className?: string
}) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
