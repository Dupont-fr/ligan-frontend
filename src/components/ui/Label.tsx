import type { LabelHTMLAttributes } from 'react'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label className={`text-sm font-medium text-text-primary ${className}`} {...props}>
      {children}
    </label>
  )
}