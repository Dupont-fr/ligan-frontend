import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ExternalLink, PauseCircle, Search, ShieldAlert, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ApiError } from '../../lib/api'
import {
  listAdminActivities,
  setActivityStatus,
  type ActivityStatus,
  type AdminActivity,
} from '../../services/admin'

const statusMeta: Record<ActivityStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  APPROVED: { label: 'Validée', variant: 'success' },
  REJECTED: { label: 'Refusée', variant: 'error' },
  SUSPENDED: { label: 'Suspendue', variant: 'neutral' },
}

const tabs: Array<{ value: ActivityStatus | undefined; label: string }> = [
  { value: undefined, label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Validées' },
  { value: 'REJECTED', label: 'Refusées' },
  { value: 'SUSPENDED', label: 'Suspendues' },
]

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

type PendingAction = { id: string; status: 'REJECTED' | 'SUSPENDED' } | null

export function AdminActivitiesPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<ActivityStatus | undefined>(undefined)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [reason, setReason] = useState('')
  const [rowError, setRowError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim())
      setPage(1)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [q])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'activities', { status: tab, q: debouncedQ, page }],
    queryFn: () => listAdminActivities({ ...(tab ? { status: tab } : {}), ...(debouncedQ ? { q: debouncedQ } : {}), page }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: Exclude<ActivityStatus, 'PENDING'>; reason?: string }) =>
      setActivityStatus(id, { status, ...(reason ? { reason } : {}) }),
    onSuccess: () => {
      invalidate()
      setPendingAction(null)
      setReason('')
      setRowError(null)
    },
    onError: (err) => {
      setRowError(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour')
      setPendingAction(null)
    },
  })

  const activities = data?.activities ?? []

  const submitReason = (e: FormEvent) => {
    e.preventDefault()
    if (!pendingAction) return
    statusMutation.mutate({ id: pendingAction.id, status: pendingAction.status, reason: reason.trim() })
  }

  const inputClass =
    'h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Activités</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Validez, refusez ou suspendez les annonces des professionnels. Seules les activités
            validées sont visibles publiquement.
          </p>
        </div>
        <span className="text-xs text-text-muted">{data ? `${data.total} activité(s)` : 'Chargement…'}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => {
              setTab(t.value)
              setPage(1)
            }}
            className={`inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors ${
              tab === t.value
                ? 'bg-primary text-white'
                : 'border border-border bg-surface text-text-secondary hover:bg-background'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un titre, une catégorie…"
            aria-label="Rechercher une activité"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {rowError ? (
        <Alert variant="error" className="mt-4">
          {rowError}
        </Alert>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-[var(--radius-sm)] bg-background" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-text-primary">Impossible de charger les activités</p>
            <p className="mt-1 text-sm text-text-secondary">Réessayez plus tard.</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-text-primary">Aucune activité</p>
            <p className="mt-1 text-sm text-text-secondary">
              {debouncedQ || tab ? 'Aucun résultat pour ce filtre.' : 'Les professionnels n’ont pas encore publié d’offre.'}
            </p>
          </div>
        ) : (
          <ul>
            {activities.map((a) => (
              <ActivityRow
                key={a.id}
                activity={a}
                pending={pendingAction?.id === a.id}
                action={pendingAction?.id === a.id ? pendingAction.status : null}
                submitting={statusMutation.isPending}
                reason={reason}
                onReasonChange={setReason}
                onAskAction={(status) => {
                  setRowError(null)
                  setPendingAction({ id: a.id, status })
                  setReason('')
                }}
                onCancel={() => setPendingAction(null)}
                onSubmitReason={submitReason}
                onApprove={() => statusMutation.mutate({ id: a.id, status: 'APPROVED' })}
              />
            ))}
          </ul>
        )}
      </div>

      {data && data.pages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <span className="text-xs text-text-muted">
            Page {data.page} sur {data.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      ) : null}
    </div>
  )
}

interface ActivityRowProps {
  activity: AdminActivity
  pending: boolean
  action: 'REJECTED' | 'SUSPENDED' | null
  submitting: boolean
  reason: string
  onReasonChange: (v: string) => void
  onAskAction: (status: 'REJECTED' | 'SUSPENDED') => void
  onCancel: () => void
  onSubmitReason: (e: FormEvent) => void
  onApprove: () => void
}

function ActivityRow({
  activity,
  pending,
  action,
  submitting,
  reason,
  onReasonChange,
  onAskAction,
  onCancel,
  onSubmitReason,
  onApprove,
}: ActivityRowProps) {
  const meta = statusMeta[activity.status]
  const pro = activity.professional
  const needsReason = pending

  return (
    <li className="border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-background/60">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <Badge variant="secondary">{activity.category}</Badge>
            {activity.slug ? (
              <Link
                to={`/business/${activity.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-primary"
              >
                Voir la fiche
                <ExternalLink className="h-3 w-3" aria-hidden />
              </Link>
            ) : null}
          </div>
          <p className="mt-1.5 break-words text-sm font-medium text-text-primary">{activity.title}</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {pro.firstName} {pro.lastName}
            {pro.email ? ` · ${pro.email}` : ''} · publié le {dateFmt.format(new Date(activity.createdAt))}
          </p>
          {activity.moderationReason && activity.status !== 'APPROVED' ? (
            <p className="mt-1 text-xs text-text-secondary">
              Motif : {activity.moderationReason}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activity.status !== 'APPROVED' ? (
            <Button size="sm" onClick={onApprove} disabled={submitting || needsReason}>
              <Check className="h-4 w-4" aria-hidden />
              {activity.status === 'PENDING' ? 'Valider' : 'Réactiver'}
            </Button>
          ) : null}
          {activity.status !== 'REJECTED' ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => onAskAction('REJECTED')}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-error-light hover:text-error"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Refuser
            </button>
          ) : null}
          {activity.status !== 'SUSPENDED' ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => onAskAction('SUSPENDED')}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              <PauseCircle className="h-3.5 w-3.5" aria-hidden />
              Suspendre
            </button>
          ) : null}
        </div>
      </div>

      {needsReason && action ? (
        <form onSubmit={onSubmitReason} className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <label htmlFor={`reason-${activity.id}`} className="mb-1 flex items-center gap-1 text-xs font-medium text-text-primary">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
              Motif {action === 'REJECTED' ? 'du refus' : 'de la suspension'} (3 caractères min.)
            </label>
            <input
              id={`reason-${activity.id}`}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              required
              minLength={3}
              maxLength={500}
              autoFocus
              placeholder="Ex : photos non conformes…"
              className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
            />
          </div>
          <Button type="submit" size="sm" variant={action === 'REJECTED' ? 'danger' : 'outline'} loading={submitting}>
            Confirmer
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        </form>
      ) : null}
    </li>
  )
}
