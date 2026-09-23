import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  to?: string
}

export function Logo({ className = '', to = '/' }: LogoProps) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`} aria-label="LIGAN+ — accueil">
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-black text-base font-black italic leading-none text-white ring-1 ring-black/10 dark:ring-white/10">
        L<span className="font-black italic text-brand-red">+</span>
      </span>
      <span className="text-lg font-black italic uppercase tracking-tight text-text-primary">
        LIGAN<span className="font-black italic text-brand-red">+</span>
      </span>
    </Link>
  )
}
