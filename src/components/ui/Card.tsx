import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)] ${className}`}
      {...props}
    />
  )
}