/**
 * Tiny UI primitives used throughout the portal. Server-component safe.
 * Tailwind-only; no client JS unless explicitly noted.
 */
import Link from 'next/link'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="portal-display text-3xl font-bold tracking-tight text-[#111827]">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white border border-[#e5e7eb] rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  href?: string
  tone?: 'default' | 'warning' | 'error' | 'success'
}) {
  const toneRing = {
    default: 'border-[#e5e7eb]',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    success: 'border-green-200 bg-green-50',
  }[tone]

  const inner = (
    <div className={`p-5 border rounded-xl bg-white ${toneRing}`}>
      <div className="text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-1.5">
        {label}
      </div>
      <div className="portal-display text-3xl font-bold text-[#111827] leading-none">
        {value}
      </div>
      {hint && <div className="text-xs text-[#6b7280] mt-2">{hint}</div>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block transition hover:-translate-y-0.5 hover:shadow-md">
        {inner}
      </Link>
    )
  }
  return inner
}

export function Button({
  children,
  variant = 'primary',
  href,
  type = 'button',
  className = '',
  ...rest
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  href?: string
  type?: 'button' | 'submit'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: 'bg-[#203055] hover:bg-[#162240] text-white',
    secondary: 'bg-white border border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#111827]',
    ghost: 'hover:bg-[#f3f4f6] text-[#374151]',
    danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white',
  }[variant]

  const cls = `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${styles} ${className}`

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}

export function Badge({
  children,
  tone = 'gray',
}: {
  children: React.ReactNode
  tone?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'navy'
}) {
  const styles = {
    gray: 'bg-[#f3f4f6] text-[#374151]',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    navy: 'bg-[#203055] text-white',
  }[tone]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${styles}`}
    >
      {children}
    </span>
  )
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 bg-white border border-dashed border-[#e5e7eb] rounded-xl">
      <div className="text-2xl mb-2 opacity-40">∅</div>
      <div className="font-medium text-[#111827]">{title}</div>
      {hint && <div className="text-sm text-[#6b7280] mt-1">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
