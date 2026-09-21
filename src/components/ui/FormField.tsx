import type { ReactNode } from 'react'
import { Label } from './Label'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-error">{error}</p> : hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
    </div>
  )
}