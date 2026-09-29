export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'invert'
  | 'invert-ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'btn-fill bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-hover',
  secondary: 'btn-fill bg-secondary text-white hover:opacity-90 active:opacity-80',
  outline:
    'border border-border bg-surface text-text-primary hover:border-text-muted',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary',
  danger: 'bg-error text-white hover:opacity-90 active:opacity-80',
  invert: 'bg-primary-contrast text-primary hover:bg-primary-contrast/90 active:bg-primary-contrast/90',
  'invert-ghost':
    'bg-transparent text-primary-contrast hover:bg-primary-contrast/10 hover:text-primary-contrast',
}

export const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-[var(--radius-sm)]',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
  lg: 'h-12 px-5 text-base rounded-[var(--radius-md)]',
}

/** Classes bouton partagées — réutilisables sur des `<a>` (téléphone, WhatsApp…). */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = ''): string {
  return `inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
}
