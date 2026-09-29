import { FolderTree, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { ThemeToggle } from '../../components/shared/ThemeToggle'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../features/auth/AuthContext'

const items = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users, end: false },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree, end: false },
]

function tabClass(isActive: boolean) {
  return `inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
    isActive ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
  }`
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Logo />
        </div>
        <nav className="p-3" aria-label="Navigation d'administration">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Administration
          </p>
          <ul className="space-y-1">
            {items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-light font-medium text-primary'
                        : 'text-text-secondary hover:bg-background hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-3">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              <Users className="h-4 w-4 shrink-0" aria-hidden />
              Mon espace
            </NavLink>
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
              Accueil
            </NavLink>
          </div>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">Espace administration</p>
            <p className="truncate text-xs text-text-muted">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-2 md:hidden"
          aria-label="Navigation d'administration mobile"
        >
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => tabClass(isActive)}>
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
