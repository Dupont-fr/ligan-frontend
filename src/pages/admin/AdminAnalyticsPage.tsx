import { useQuery } from '@tanstack/react-query'
import { Eye, MapPin, MessageCircle, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import {
  getPlatformOverview,
  type BusinessEventType,
  type StatsPeriod,
} from '../../services/analytics'

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: 'today', label: 'Aujourd’hui' },
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
]

const EVENT_META: { type: BusinessEventType; label: string; icon: typeof Eye }[] = [
  { type: 'PROFILE_VIEW', label: 'Vues de profil', icon: Eye },
  { type: 'PHONE_CLICK', label: 'Appels', icon: Phone },
  { type: 'WHATSAPP_CLICK', label: 'WhatsApp', icon: MessageCircle },
  { type: 'DIRECTION_CLICK', label: 'Itinéraires', icon: MapPin },
]

const statusMeta: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  APPROVED: { label: 'Validée', variant: 'success' },
  REJECTED: { label: 'Refusée', variant: 'error' },
  SUSPENDED: { label: 'Suspendue', variant: 'neutral' },
}

export function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<StatsPeriod>('7d')

  const overviewQuery = useQuery({
    queryKey: ['analytics', 'overview', period],
    queryFn: () => getPlatformOverview(period),
  })

  const overview = overviewQuery.data
  const topActivities = overview?.byActivity ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Statistiques plateforme
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Vues, appels, messages WhatsApp et itinéraires sur toutes les fiches publiques.
          </p>
        </div>
        <div
          className="inline-flex rounded-[var(--radius-sm)] border border-border bg-surface p-1"
          role="tablist"
          aria-label="Période"
        >
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`min-h-9 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors ${
                period === p.id
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {overviewQuery.isError ? (
        <Alert variant="error">
          Impossible de charger les statistiques. Réessaie dans un instant.
        </Alert>
      ) : null}

      {/* Totaux plateforme */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {EVENT_META.map(({ type, label, icon: Icon }) => (
          <Card key={type} className="p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <Icon className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
              {overviewQuery.isLoading ? '—' : (overview?.totals[type] ?? 0)}
            </p>
          </Card>
        ))}
      </div>

      {/* Top activités */}
      {overviewQuery.isLoading ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
      ) : topActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-text-primary">Pas encore de données</p>
          <p className="mt-1 text-sm text-text-secondary">
            Les interactions sur les fiches de la plateforme apparaîtront ici.
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {topActivities.map((activity, index) => {
            const meta = statusMeta[activity.status]
            return (
              <div key={activity.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-text-muted">
                    {index + 1}.
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
                    {activity.title}
                  </p>
                  {meta ? <Badge variant={meta.variant}>{meta.label}</Badge> : null}
                  <span className="shrink-0 text-xs font-medium text-text-muted">
                    {activity.total} interaction{activity.total > 1 ? 's' : ''}
                  </span>
                </div>
                {activity.professional ? (
                  <p className="mt-1 flex items-center gap-1.5 pl-7 text-xs text-text-muted">
                    <UserRound className="h-3.5 w-3.5" aria-hidden />
                    {activity.professional.firstName} {activity.professional.lastName}
                  </p>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2 pl-7 sm:grid-cols-4">
                  {EVENT_META.map(({ type, label, icon: Icon }) => (
                    <div
                      key={type}
                      className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-background px-3 py-2 text-xs sm:justify-start"
                    >
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {label}
                      </span>
                      <span className="font-semibold tabular-nums text-text-primary">
                        {activity.counts[type]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
