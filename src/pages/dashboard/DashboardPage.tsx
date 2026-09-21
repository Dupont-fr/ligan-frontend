import {
  BarChart3,
  Clock,
  CreditCard,
  GalleryHorizontalEnd,
  LayoutGrid,
  LogOut,
  MapPin,
  MessageSquare,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ThemeToggle } from '../../components/shared/ThemeToggle'

const roleLabels: Record<string, string> = {
  CUSTOMER: 'Client',
  PROFESSIONAL: 'Professionnel',
  ADMIN: 'Administrateur',
}

const navItems = [
  { label: 'Mon activité', icon: LayoutGrid, soon: true },
  { label: 'Services', icon: MapPin, soon: true },
  { label: 'Horaires', icon: Clock, soon: true },
  { label: 'Photos', icon: GalleryHorizontalEnd, soon: true },
  { label: 'Avis', icon: MessageSquare, soon: true },
  { label: 'Statistiques', icon: BarChart3, soon: true },
  { label: 'Abonnement', icon: CreditCard, soon: true },
]

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary text-white">
            <MapPin className="h-5 w-5" aria-hidden />
          </div>
          <span className="text-lg font-bold text-text-primary">
            Ligan<span className="text-primary">+</span>
          </span>
        </div>
        <nav className="p-3" aria-label="Navigation du tableau de bord">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-secondary"
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-text-muted">
                    {item.soon ? 'Bientôt' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              Bonjour, {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-text-muted">Espace {roleLabels[user?.role ?? 'CUSTOMER']}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              Déconnexion
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
            <p className="text-sm text-text-secondary">
              Gérez votre présence sur Ligan+ depuis cet espace.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
              <p className="text-sm font-medium text-text-primary">Profil</p>
              <p className="mt-1 text-xs text-text-secondary">
                {user?.firstName} {user?.lastName} · {user?.email}
              </p>
              <Badge variant="info" className="mt-3">
                {roleLabels[user?.role ?? 'CUSTOMER']}
                {user?.isVerified ? ' · vérifié' : ' · email non vérifié'}
              </Badge>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
              <p className="text-sm font-medium text-text-primary">Fiche d&apos;activité</p>
              <p className="mt-1 text-xs text-text-secondary">
                Aucune activité pour le moment.
              </p>
              <p className="mt-2 text-xs text-text-muted">Arrive au Sprint 3.</p>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
              <p className="text-sm font-medium text-text-primary">Statistiques</p>
              <p className="mt-1 text-xs text-text-secondary">Aucune donnée à afficher.</p>
              <p className="mt-2 text-xs text-text-muted">Arrive au Sprint 10.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}