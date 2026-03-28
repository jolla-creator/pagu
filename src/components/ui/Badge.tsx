import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'allergen' | 'success' | 'warning' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-600',
    allergen: 'bg-red-50 text-red-600 border border-red-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
