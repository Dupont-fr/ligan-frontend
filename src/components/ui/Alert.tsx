import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  className?: string
}

const variantConfig: Record<AlertVariant, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'border-info/30 bg-info-light', icon: 'text-info', Icon: Info },
  success: { box: 'border-success/30 bg-success-light', icon: 'text-success', Icon: CheckCircle2 },
  error: { box: 'border-error/30 bg-error-light', icon: 'text-error', Icon: AlertCircle },
  warning: { box: 'border-warning/30 bg-warning-light', icon: 'text-warning', Icon: TriangleAlert },
}

export function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const { box, icon, Icon } = variantConfig[variant]
  return (
    <div role="alert" className={`flex items-start gap-2.5 rounded-[var(--radius-md)] border px-3.5 py-3 ${box} ${className}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} aria-hidden />
      <p className="text-sm text-text-primary">{children}</p>
    </div>
  )
}