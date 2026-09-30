import { useQuery } from '@tanstack/react-query'
import { Eye, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Card } from '../../components/ui/Card'
import {
  getMyStats,
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

export function StatsSection() {
  const [period, setPeriod] = useState<StatsPeriod>('7d')

  const statsQuery = useQuery({
    queryKey: ['analytics', 'stats', period],
    queryFn: () => getMyStats(period),
  })

  const stats = statsQuery.data
  const activitiesWithStats = (stats?.byActivity ?? [])
    .slice()
    .sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Statistiques</h2>
          <p className="text-sm text-text-muted">
            Vos vues, appels, messages WhatsApp et itinéraires.
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

      {statsQuery.isError ? (
        <Alert variant="error">
          Impossible de charger les statistiques. Réessaie dans un instant.
        </Alert>
      ) : null}

      {/* Tuiles globales */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {EVENT_META.map(({ type, label, icon: Icon }) => (
          <Card key={type} className="p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <Icon className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
              {statsQuery.isLoading ? '—' : (stats?.totals[type] ?? 0)}
            </p>
          </Card>
        ))}
      </div>

      {statsQuery.isLoading ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
      ) : activitiesWithStats.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-text-primary">Pas encore de données</p>
          <p className="mt-1 text-sm text-text-secondary">
            Les interactions sur vos fiches apparaîtront ici dès les premières visites.
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {activitiesWithStats.map((activity) => (
            <div key={activity.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
                  {activity.title}
                </p>
                <span className="shrink-0 text-xs font-medium text-text-muted">
                  {activity.total} interaction{activity.total > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          ))}
        </Card>
      )}
    </div>
  )
}
