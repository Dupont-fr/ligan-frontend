import { Database, MapPin, Search } from 'lucide-react'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { ThemeToggle } from './components/shared/ThemeToggle'
import { useHealth } from './services/health'

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} h ${m} min`
  return `${m} min`
}

function StatusIndicator() {
  const { data, isLoading, isError } = useHealth()

  if (isLoading) {
    return (
      <Card className="flex animate-pulse items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-border-light" />
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-border-light" />
          <div className="h-3 w-28 rounded bg-border-light" />
        </div>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-error-light">
          <Database className="h-5 w-5 text-error" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Backend injoignable</p>
          <p className="text-xs text-text-secondary">
            Démarre le backend (backend : npm run dev) puis recharge la page.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-primary-light">
        <Database className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {data.app} API · v{data.version}
          <Badge variant="info" className="ml-2">
            {data.env}
          </Badge>
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">
          Uptime {formatUptime(data.uptime)} ·{' '}
          {data.db.connected ? (
            <Badge variant="success">MongoDB Atlas {data.db.state}</Badge>
          ) : (
            <Badge variant="error">MongoDB {data.db.state}</Badge>
          )}
        </p>
      </div>
    </Card>
  )
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary text-white">
              <MapPin className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-bold text-text-primary">
              Ligan<span className="text-primary">+</span>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Sprint 0 — Infrastructure</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Trouvez le professionnel qu&apos;il vous faut près de chez vous
          </h1>
          <p className="mt-3 text-base text-text-secondary">
            Ligan+ relie les clients aux professionnels locaux : mécaniciens, plombiers, coiffeurs,
            boulangeries et bien plus.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-text-muted">
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <input
              type="search"
              placeholder="Que recherchez-vous ? (ex : mécanicien)"
              aria-label="Rechercher un professionnel"
              className="h-12 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <Button size="lg">Rechercher</Button>
        </div>

        <section className="mx-auto mt-8 max-w-xl" aria-label="État des services">
          <h2 className="mb-3 text-sm font-medium text-text-secondary">
            Vérification de l&apos;infrastructure
          </h2>
          <StatusIndicator />
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-text-secondary sm:flex-row">
          <span>
            © 2026 <span className="font-medium text-text-primary">Ligan+</span> — Plateforme de
            découverte de professionnels locaux.
          </span>
          <span className="text-xs text-text-muted">Développé sprint par sprint.</span>
        </div>
      </footer>
    </div>
  )
}

export default App