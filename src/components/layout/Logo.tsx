import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  to?: string
}

export function Logo({ className = '', to = '/' }: LogoProps) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`} aria-label="Ligan+ — accueil">
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-primary text-base font-black leading-none text-white">
        L<span className="text-secondary">+</span>
      </span>
      <span className="text-lg font-bold text-text-primary">
        Ligan<span className="text-primary">+</span>
      </span>
    </Link>
  )
}
