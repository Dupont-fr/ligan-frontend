import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ExternalLink, Search, ShieldAlert, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StarRating } from '../../components/ui/StarRating'
import { ApiError } from '../../lib/api'
import { listAdminReviews, setReviewStatus, type AdminReview, type ReviewStatus } from '../../services/admin'

const statusMeta: Record<ReviewStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  APPROVED: { label: 'Approuvé', variant: 'success' },
  REJECTED: { label: 'Rejeté', variant: 'error' },
}

const tabs: Array<{ value: ReviewStatus | undefined; label: string }> = [
  { value: undefined, label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'REJECTED', label: 'Rejetés' },
]

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export function AdminReviewsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<ReviewStatus | undefined>(undefined)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [pendingAction, setPendingAction] = useState<{ id: string } | null>(null)
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
    queryKey: ['admin', 'reviews', { status: tab, q: debouncedQ, page }],
    queryFn: () =>
      listAdminReviews({ ...(tab ? { status: tab } : {}), ...(debouncedQ ? { q: debouncedQ } : {}), page }),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      setReviewStatus(id, { status, ...(reason ? { reason } : {}) }),
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

  const reviews = data?.reviews ?? []

  const submitReason = (e: FormEvent) => {
    e.preventDefault()
    if (!pendingAction) return
    statusMutation.mutate({ id: pendingAction.id, status: 'REJECTED', reason: reason.trim() })
  }

  const inputClass =
    'h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Avis</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Modérez les avis des utilisateurs. Seuls les avis approuvés sont visibles publiquement.
          </p>
        </div>
        <span className="text-xs text-text-muted">{data ? `${data.total} avis` : 'Chargement…'}</span>
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
            placeholder="Rechercher un commentaire…"
            aria-label="Rechercher un avis"
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
            <p className="text-sm font-medium text-text-primary">Impossible de charger les avis</p>
            <p className="mt-1 text-sm text-text-secondary">Réessayez plus tard.</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-text-primary">Aucun avis</p>
            <p className="mt-1 text-sm text-text-secondary">
              {debouncedQ || tab ? 'Aucun résultat pour ce filtre.' : 'Les utilisateurs n’ont pas encore publié d’avis.'}
            </p>
          </div>
        ) : (
          <ul>
            {reviews.map((r) => (
              <ReviewRow
                key={r.id}
                review={r}
                pending={pendingAction?.id === r.id}
                submitting={statusMutation.isPending}
                reason={reason}
                onReasonChange={setReason}
                onAskReject={() => {
                  setRowError(null)
                  setPendingAction({ id: r.id })
                  setReason('')
                }}
                onCancel={() => setPendingAction(null)}
                onSubmitReason={submitReason}
                onApprove={() => statusMutation.mutate({ id: r.id, status: 'APPROVED' })}
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

interface ReviewRowProps {
  review: AdminReview
  pending: boolean
  submitting: boolean
  reason: string
  onReasonChange: (v: string) => void
  onAskReject: () => void
  onCancel: () => void
  onSubmitReason: (e: FormEvent) => void
  onApprove: () => void
}

function ReviewRow({
  review,
  pending,
  submitting,
  reason,
  onReasonChange,
  onAskReject,
  onCancel,
  onSubmitReason,
  onApprove,
}: ReviewRowProps) {
  const meta = statusMeta[review.status]

  return (
    <li className="border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-background/60">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <StarRating value={review.rating} size="sm" />
            {review.activity ? (
              review.activity.slug ? (
                <Link
                  to={`/business/${review.activity.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-primary"
                >
                  {review.activity.title}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </Link>
              ) : (
                <span className="text-xs font-medium text-text-muted">{review.activity.title}</span>
              )
            ) : null}
          </div>
          <p className="mt-1.5 break-words text-sm text-text-primary">“{review.comment}”</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {review.reviewer.firstName} {review.reviewer.lastName}
            {review.reviewer.email ? ` · ${review.reviewer.email}` : ''} · le{' '}
            {dateFmt.format(new Date(review.createdAt))}
          </p>
          {review.moderationReason && review.status !== 'APPROVED' ? (
            <p className="mt-1 text-xs text-text-secondary">Motif : {review.moderationReason}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {review.status !== 'APPROVED' ? (
            <Button size="sm" onClick={onApprove} disabled={submitting || pending}>
              <Check className="h-4 w-4" aria-hidden />
              {review.status === 'PENDING' ? 'Approuver' : 'Réactiver'}
            </Button>
          ) : null}
          {review.status !== 'REJECTED' ? (
            <button
              type="button"
              disabled={submitting}
              onClick={onAskReject}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-error-light hover:text-error"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Rejeter
            </button>
          ) : null}
        </div>
      </div>

      {pending ? (
        <form onSubmit={onSubmitReason} className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <label htmlFor={`reason-${review.id}`} className="mb-1 flex items-center gap-1 text-xs font-medium text-text-primary">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
              Motif du refus (3 caractères min.)
            </label>
            <input
              id={`reason-${review.id}`}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              required
              minLength={3}
              maxLength={500}
              autoFocus
              placeholder="Ex : propos injurieux…"
              className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
            />
          </div>
          <Button type="submit" size="sm" variant="danger" loading={submitting}>
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
