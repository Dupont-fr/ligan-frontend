import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="bg-brand-red text-white">
        <div className="mx-auto flex h-8 w-full max-w-6xl items-center justify-center px-4">
          <span className="truncate text-xs font-medium">
            Le + de confiance pour trouver des pros qualifiés près de chez vous
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
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
                <span className="hidden md:inline">Rechercher</span>
              </Button>
            </Link>
            <ThemeToggle />
            {status === 'authenticated' && user ? (
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Mon espace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button size="sm">Créer un compte</Button>
                </Link>
              </>
            )}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-background hover:text-text-primary lg:hidden"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            className="border-t border-border bg-surface px-4 pb-4 pt-2 lg:hidden"
            aria-label="Navigation mobile"
          >
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={closeMenu}
                    className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {status === 'authenticated' && user ? (
                <Link to="/dashboard" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">
                    Mon espace
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button className="w-full">Créer un compte</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        ) : null}
      </header>
    </>
  )
}
