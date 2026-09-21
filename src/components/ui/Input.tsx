import type { InputHTMLAttributes, Ref } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  ref?: Ref<HTMLInputElement>
}

export function Input({ error = false, className = '', ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-[var(--radius-md)] border bg-surface px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        error ? 'border-error focus-visible:ring-error/40' : 'border-border focus-visible:ring-primary/40'
      } ${className}`}
      {...props}
    />
  )
}