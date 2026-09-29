import { ChevronDown, Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../shared/ThemeToggle'
import { Button } from '../ui/Button'
import { useAuth } from '../../features/auth/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import type { UserRole } from '../../services/auth'
import { Logo } from './Logo'

const navLinks: { label: string; to: string; hideFor?: UserRole[] }[] = [
  { label: 'Trouver un pro', to: '/trouver' },
  { label: 'Comment ça marche', to: '/#how' },
  { label: 'Devenir pro', to: '/register?role=PROFESSIONAL', hideFor: ['PROFESSIONAL', 'ADMIN'] },
]

export function SiteHeader() {
  const { user, status } = useAuth()
  const categories = useCategories()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="bg-primary text-primary-contrast">
        <div className="mx-auto flex h-8 w-full max-w-6xl items-center justify-center px-4">
          <span className="truncate text-xs font-medium">
            Consultez les professionnels de votre quartier — gratuit et sans compte
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Logo />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                <Menu className="h-4 w-4" aria-hidden />
                Catégories
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden />
              </button>
              <div className="invisible absolute left-0 top-full z-30 w-64 -translate-y-1 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface opacity-0 shadow-[var(--shadow-md)] transition-[opacity,transform,visibility] duration-150 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <ul className="max-h-[70vh] overflow-y-auto py-1">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        to={`/trouver?categorie=${encodeURIComponent(cat.label)}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
                      >
                        <cat.icon className="h-4 w-4 shrink-0" aria-hidden />
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/trouver"
                  className="block border-t border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-light"
                >
                  Voir toutes les activités →
                </Link>
              </div>
            </div>
            {navLinks
              .filter((link) => !link.hideFor?.includes(user?.role ?? 'CUSTOMER'))
              .map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            {user?.role === 'ADMIN' ? (
              <Link
                to="/admin"
                className="text-sm font-medium text-secondary transition-colors hover:underline"
              >
                Espace admin
              </Link>
            ) : null}
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
              {navLinks
                .filter((link) => !link.hideFor?.includes(user?.role ?? 'CUSTOMER'))
                .map((link) => (
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
              {user?.role === 'ADMIN' ? (
                <li>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-background"
                  >
                    Espace admin
                  </Link>
                </li>
              ) : null}
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
