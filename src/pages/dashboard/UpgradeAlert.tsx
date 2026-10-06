import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { listPlans } from '../../services/plans'
import { getMySubscription } from '../../services/subscriptions'

function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

interface UpgradeAlertProps {
  onSeePlans: () => void
}

/** Alerte d'upgrade pour les pros en plan gratuit — masquée dès qu'un plan
    payant est actif ; fermable pour la session (réaffichée à la visite suivante). */
export function UpgradeAlert({ onSeePlans }: UpgradeAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  // Mêmes clés de cache que SubscriptionSection : un paiement confirmé
  // invalidé ici fait disparaître l'alerte sans rechargement.
  const subQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: getMySubscription,
    staleTime: 60_000,
    retry: 1,
  })
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: listPlans, staleTime: 5 * 60_000 })

  const planCode = subQuery.data?.planCode ?? 'FREE'
  if (dismissed || subQuery.isLoading || subQuery.isError || planCode !== 'FREE') return null

  const plans = plansQuery.data?.plans ?? []
  const currentOrder = plans.find((p) => p.code === planCode)?.order ?? 0
  const nextPlan = plans
    .filter((p) => p.price > 0 && p.order > currentOrder)
    .sort((a, b) => a.order - b.order)[0]

  return (
    <aside
      aria-label="Passez au plan supérieur"
      className="mb-6 flex flex-col gap-4 rounded-[var(--radius-md)] border border-primary/30 bg-primary-light p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-contrast">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">Passez au plan supérieur&nbsp;!</p>
          <p className="mt-0.5 text-sm text-text-secondary">
            {nextPlan ? (
              <>
                Vous êtes sur le plan Découverte (gratuit). Passez au plan{' '}
                <span className="font-semibold text-text-primary">{nextPlan.name}</span> —{' '}
                {formatPrice(nextPlan.price)}
                {nextPlan.durationDays > 0 ? ' / mois' : ''} — pour plus de visibilité.
              </>
            ) : (
              'Vous êtes sur le plan gratuit. Passez au plan supérieur pour plus de visibilité et des activités illimitées.'
            )}
          </p>
          {nextPlan && nextPlan.features.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
              {nextPlan.features.slice(0, 3).map((feature) => (
                <li key={feature} className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button onClick={onSeePlans}>
          Passer au plan {nextPlan?.name ?? 'supérieur'}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Plus tard
        </Button>
      </div>
    </aside>
  )
}
