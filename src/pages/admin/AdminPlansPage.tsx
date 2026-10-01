import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Save } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ApiError } from '../../lib/api'
import { listAdminPlans, updateAdminPlan, type AdminPlan } from '../../services/admin'

function PlanForm({ plan, onSaved }: { plan: AdminPlan; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient()
  const [price, setPrice] = useState(String(plan.price))
  const [duration, setDuration] = useState(String(plan.durationDays))
  const [features, setFeatures] = useState(plan.features.join('\n'))
  const [active, setActive] = useState(plan.isActive)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      updateAdminPlan(plan.id, {
        price: Number(price),
        durationDays: Number(duration),
        features: features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        isActive: active,
      }),
    onSuccess: () => {
      setError(null)
      onSaved(`Plan ${plan.code} mis à jour.`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Enregistrement impossible'),
  })

  const priceValue = Number(price)
  const durationValue = Number(duration)
  const priceInvalid = !Number.isInteger(priceValue) || priceValue < 0 || priceValue > 10_000_000
  const durationInvalid = !Number.isInteger(durationValue) || durationValue < 0 || durationValue > 3650

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-text-primary">{plan.name}</span>
        <div className="flex items-center gap-2">
          <Badge variant={plan.code === 'FREE' ? 'neutral' : 'success'}>{plan.code}</Badge>
          {plan.highlight ? <Badge variant="promo">Mis en avant</Badge> : null}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`plan-price-${plan.id}`} className="mb-1 block text-xs font-medium text-text-secondary">
              Prix (FCFA)
            </label>
            <input
              id={`plan-price-${plan.id}`}
              type="number"
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-base text-text-primary outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor={`plan-duration-${plan.id}`} className="mb-1 block text-xs font-medium text-text-secondary">
              Durée (jours)
            </label>
            <input
              id={`plan-duration-${plan.id}`}
              type="number"
              min={0}
              step={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-base text-text-primary outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`plan-features-${plan.id}`} className="mb-1 block text-xs font-medium text-text-secondary">
            Avantages (un par ligne)
          </label>
          <textarea
            id={`plan-features-${plan.id}`}
            rows={5}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Plan visible publiquement
        </label>
      </div>

      {error ? (
        <Alert variant="error" className="mt-3">
          {error}
        </Alert>
      ) : null}

      <Button
        size="sm"
        className="mt-4 self-start"
        disabled={priceInvalid || durationInvalid || mutation.isPending}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <Save className="h-4 w-4" aria-hidden />
        Enregistrer
      </Button>
      {priceInvalid || durationInvalid ? (
        <p className="mt-2 text-xs text-error">Prix et durée doivent être des entiers positifs.</p>
      ) : null}
    </Card>
  )
}

export function AdminPlansPage() {
  const [message, setMessage] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: listAdminPlans,
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Plans d’abonnement</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Les prix modifiés ici sont appliqués immédiatement au catalogue public — jamais codés en dur
            dans le site.
          </p>
        </div>
        <Badge variant="info">
          <CreditCard className="h-3.5 w-3.5" aria-hidden />
          Mobile money
        </Badge>
      </div>

      {message ? (
        <Alert variant="success" className="mt-4">
          {message}
        </Alert>
      ) : null}

      {query.isLoading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
          ))}
        </div>
      ) : query.isError ? (
        <Alert variant="error" className="mt-4">
          Impossible de charger les plans.
        </Alert>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(query.data?.plans ?? []).map((plan) => (
            <PlanForm key={plan.id} plan={plan} onSaved={setMessage} />
          ))}
        </div>
      )}
    </div>
  )
}
