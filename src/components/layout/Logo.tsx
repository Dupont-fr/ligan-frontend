import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  to?: string
}

export function Logo({ className = '', to = '/' }: LogoProps) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`} aria-label="LIGAN+ — accueil">
      <img
        src="/logo-mark.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded-[var(--radius-md)] ring-1 ring-black/10 dark:ring-white/10"
      />
      <span className="text-lg font-black italic uppercase tracking-tight text-text-primary">
        LIGAN<span className="text-[1.5em] font-black italic leading-none text-brand-red">+</span>
      </span>
    </Link>
  )
}
