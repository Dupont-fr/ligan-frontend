import { MapPin } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '../../components/shared/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary text-white">
              <MapPin className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-bold text-text-primary">
              Ligan<span className="text-primary">+</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-text-secondary sm:flex-row">
          <span>
            © 2026 <span className="font-medium text-text-primary">Ligan+</span> — Plateforme de
            découverte de professionnels locaux.
          </span>
          <Link to="/" className="text-xs text-text-muted hover:text-text-primary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </footer>
    </div>
  )
}