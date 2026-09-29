import { useQuery } from '@tanstack/react-query'
import { Activity, ArrowRight, FolderTree, Send, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { getStats } from '../../services/admin'

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStats,
  })

  const stats = data?.stats

  const cards = stats
    ? [
        {
          to: '/admin/users',
          icon: Users,
          label: 'Utilisateurs',
          value: stats.users.total,
          detail: `${stats.users.customers} clients · ${stats.users.professionals} pros · ${stats.users.admins} admins`,
        },
        {
          to: '/admin/categories',
          icon: FolderTree,
          label: 'Catégories',
          value: stats.categories.total,
          detail: `${stats.categories.active} visibles publiquement`,
        },
        {
          to: '/',
          icon: Activity,
          label: 'Activités publiées',
          value: stats.activities.total,
          detail: 'Offres des professionnels',
        },
        {
          to: '/',
          icon: Send,
          label: 'Sollicitations',
          value: stats.solicitations.total,
          detail: `${stats.solicitations.pending} en attente · ${stats.solicitations.accepted} acceptées · ${stats.solicitations.declined} refusées`,
        },
      ]
    : []

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Vue d’ensemble de la plateforme LIGAN+ et accès rapide aux outils d’administration.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[var(--radius-md)] bg-surface" />
          ))}
        </div>
      ) : isError || !stats ? (
        <p className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-5 text-sm text-text-secondary">
          Impossible de charger les statistiques. Réessayez plus tard.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {cards.map(({ to, icon: Icon, label, value, detail }) => (
            <Link key={label} to={to} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                      <Icon className="h-4 w-4" aria-hidden />
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
                    <p className="mt-1 truncate text-xs text-text-muted">{detail}</p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">Accès rapide</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/users" className="text-sm font-medium text-primary hover:underline">
            Gérer les utilisateurs →
          </Link>
          <Link to="/admin/categories" className="text-sm font-medium text-primary hover:underline">
            Gérer les catégories →
          </Link>
          <Link to="/trouver" className="text-sm font-medium text-primary hover:underline">
            Voir le site en tant que visiteur →
          </Link>
        </div>
      </div>
    </div>
  )
}
