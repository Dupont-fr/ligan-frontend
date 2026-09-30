import { Home, LayoutGrid, Search, UserRound } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

const activeClassName = 'text-primary'

/**
 * Barre de navigation basse (mobile uniquement, < lg) — navigation type app.
 * Safe-area iOS gérée via `env(safe-area-inset-bottom)` dans `index.css`.
 */
export function BottomNav() {
  const { pathname } = useLocation()
  const { status } = useAuth()
  const spaceTo = status === 'authenticated' ? '/dashboard' : '/login'

  const items = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/trouver', icon: Search, label: 'Rechercher' },
    { to: '/categories', icon: LayoutGrid, label: 'Catégories' },
    { to: spaceTo, icon: UserRound, label: 'Mon espace' },
  ]

  return (
    <nav
      className="bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      aria-label="Navigation rapide"
    >
      <ul className="mx-auto flex h-14 w-full max-w-lg items-stretch">
        {items.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to.split('?')[0])
          return (
            <li key={label} className="flex-1">
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors hover:text-primary ${
                  active ? activeClassName : 'text-text-muted'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
