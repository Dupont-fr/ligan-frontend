import { Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../shared/ThemeToggle'
import { Button } from '../ui/Button'
import { useAuth } from '../../features/auth/AuthContext'
import { Logo } from './Logo'

const navLinks = [
  { label: 'Trouver un pro', to: '/trouver' },
  { label: 'Comment ça marche', to: '/#how' },
  { label: 'Devenir pro', to: '/register?role=PROFESSIONAL' },
]

export function SiteHeader() {
  const { user, status } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      <div className="bg-primary text-white">
        <div className="mx-auto flex h-8 w-full max-w-6xl items-center justify-center px-4 text-xs font-medium">
          Le + de confiance pour trouver des pros qualifiés près de chez vous
        </div>
      </div>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/trouver" className="hidden sm:block" aria-label="Rechercher">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" aria-hidden />
                Rechercher
              </Button>
            </Link>
            <ThemeToggle />
            {status === 'authenticated' && user ? (
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Mon espace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" onClick={() => navigate('/register')}>
                    Créer un compte
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
