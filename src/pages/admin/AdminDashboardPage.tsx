import { useQuery } from '@tanstack/react-query'
import { Activity, ArrowUpRight, FolderTree, Send, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStats } from '../../services/admin'

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStats,
  })

  const stats = data?.stats

  const tiles = stats
    ? [
        {
          to: '/admin/users',
          icon: Users,
          label: 'Utilisateurs',
          value: stats.users.total,
          detail: `${stats.users.customers} clients · ${stats.users.professionals} pros · ${stats.users.admins} admins${stats.users.suspended ? ` · ${stats.users.suspended} suspendus` : ''}`,
        },
        {
          to: '/admin/categories',
          icon: FolderTree,
          label: 'Catégories',
          value: stats.categories.total,
          detail: `${stats.categories.active} visibles publiquement`,
        },
        {
          to: '/admin/activities',
          icon: Activity,
          label: 'Activités',
          value: stats.activities.total,
          detail: `${stats.activities.approved} validées · ${stats.activities.pending} en attente${stats.activities.rejected ? ` · ${stats.activities.rejected} refusées` : ''}${stats.activities.suspended ? ` · ${stats.activities.suspended} suspendues` : ''}`,
        },
        {
          to: '/dashboard',
          icon: Send,
          label: 'Sollicitations',
          value: stats.solicitations.total,
          detail: `${stats.solicitations.pending} en attente · ${stats.solicitations.accepted} acceptées · ${stats.solicitations.declined} refusées`,
        },
      ]
    : []

  const links = [
    { to: '/admin/activities', label: 'Valider les activités en attente', detail: 'Approuver, refuser ou suspendre une annonce' },
    { to: '/admin/users', label: 'Gérer les utilisateurs', detail: 'Créer un compte, changer un rôle, suspendre' },
    { to: '/admin/categories', label: 'Gérer les catégories', detail: 'Ajouter un métier, réordonner, masquer' },
    { to: '/trouver', label: 'Voir le site en tant que visiteur', detail: 'Contrôler le parcours de découverte' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Tableau de bord</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Vue d’ensemble de la plateforme LIGAN+ en temps réel.
          </p>
        </div>
        <span className="text-xs text-text-muted">
          {stats ? `${stats.users.total} comptes · ${stats.activities.total} activités` : 'Chargement…'}
        </span>
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-border bg-border md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      ) : isError || !stats ? (
        <p className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-5 text-sm text-text-secondary">
          Impossible de charger les statistiques. Réessayez plus tard.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-border bg-border md:grid-cols-4">
          {tiles.map(({ to, icon: Icon, label, value, detail }) => (
            <Link key={label} to={to} className="group bg-surface p-4 transition-colors hover:bg-background/60">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
                <ArrowUpRight
                  className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
                {value}
              </p>
              <p className="mt-1 text-xs text-text-muted">{detail}</p>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Raccourcis
      </h2>
      <div className="mt-2 divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
        {links.map(({ to, label, detail }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background/60"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="truncate text-xs text-text-muted">{detail}</p>
            </div>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
