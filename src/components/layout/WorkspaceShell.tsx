import { LogOut, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { ThemeToggle } from '../shared/ThemeToggle'
import { Button } from '../ui/Button'
import { Logo } from './Logo'

export interface ShellItem {
  label: string
  icon: LucideIcon
  active?: boolean
  onClick?: () => void
  to?: string
}

export interface ShellGroup {
  label?: string
  items: ShellItem[]
}

interface WorkspaceShellProps {
  groups: ShellGroup[]
  breadcrumb: string[]
  actions?: ReactNode
  children: ReactNode
}

function initials(firstName?: string, lastName?: string) {
  return `${(firstName ?? '').charAt(0)}${(lastName ?? '').charAt(0)}`.toUpperCase() || '?'
}

function itemClasses(active?: boolean) {
  return `flex min-w-0 items-center gap-2.5 border px-2.5 py-1.5 text-sm transition-colors duration-150 ${
    active
      ? 'border-border bg-background font-medium text-text-primary'
      : 'border-transparent text-text-secondary hover:bg-background hover:text-text-primary'
  }`
}

/**
 * Coque des espaces connectés (pro + admin), inspirée de Vercel/GitHub :
 * sidebar à groupes labellisés, barre supérieure avec fil d'Ariane et
 * avatar, contenu centré en largeur maximale.
 */
export function WorkspaceShell({ groups, breadcrumb, actions, children }: WorkspaceShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const renderItem = (item: ShellItem, key: string) => {
    const content = (
      <>
        <item.icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{item.label}</span>
      </>
    )
    const classes = `rounded-[var(--radius-sm)] ${itemClasses(item.active)}`

    if (item.to) {
      return (
        <Link key={key} to={item.to} className={classes}>
          {content}
        </Link>
      )
    }
    return (
      <button key={key} type="button" onClick={item.onClick} className={`w-full text-left ${classes}`}>
        {content}
      </button>
    )
  }

  const flatItems = groups.flatMap((group) => group.items)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Logo />
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Navigation">
          {groups.map((group, gi) => (
            <div key={group.label ?? gi} className="mb-4 last:mb-0">
              {group.label ? (
                <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {group.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {group.items.map((item, ii) => (
                  <li key={item.label ?? ii}>{renderItem(item, `${gi}-${ii}`)}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 px-2.5 py-1.5">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-light text-xs font-semibold text-primary">
              {initials(user?.firstName, user?.lastName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-[11px] text-text-muted">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
          <nav aria-label="Fil d'Ariane" className="min-w-0">
            <ol className="flex items-center gap-1.5 truncate text-sm">
              {breadcrumb.map((crumb, i) => (
                <li key={crumb} className="flex min-w-0 items-center gap-1.5">
                  {i > 0 ? <span className="text-text-muted" aria-hidden>/</span> : null}
                  <span
                    className={
                      i === breadcrumb.length - 1
                        ? 'truncate font-medium text-text-primary'
                        : 'truncate text-text-secondary'
                    }
                  >
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <ThemeToggle />
            <span
              title={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-full)] border border-border bg-surface text-[11px] font-semibold text-text-secondary md:hidden"
            >
              {initials(user?.firstName, user?.lastName)}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Déconnexion">
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        <nav
          className="flex gap-1.5 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:hidden"
          aria-label="Sections"
        >
          {flatItems.map((item, i) => {
            const content = (
              <>
                <item.icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </>
            )
            const classes = `flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              item.active
                ? 'border-border bg-background text-text-primary'
                : 'border-transparent text-text-secondary'
            }`
            return item.to ? (
              <Link key={`${item.label}-${i}`} to={item.to} className={classes}>
                {content}
              </Link>
            ) : (
              <button key={`${item.label}-${i}`} type="button" onClick={item.onClick} className={classes}>
                {content}
              </button>
            )
          })}
        </nav>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
