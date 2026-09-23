import { Link, Outlet } from 'react-router-dom'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { Logo } from '../../components/layout/Logo'
import { ThemeToggle } from '../../components/shared/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/trouver" className="text-sm text-text-secondary hover:text-primary">
              Trouver un pro
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
