import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, CreditCard, Loader2, Smartphone, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { ApiError } from '../../lib/api'
import { listPlans, type PublicPlan } from '../../services/plans'
import {
  downgradeToFree,
  getMySubscription,
  getPaymentStatus,
  startCheckout,
  type PaymentStatus,
  type StartedPayment,
} from '../../services/subscriptions'

const checkoutSchema = z.object({
  network: z.enum(['mtn', 'orange']),
  phoneNumber: z
    .string()
    .trim()
    .min(8, 'Numéro invalide (8 chiffres minimum)')
    .max(15, 'Numéro invalide')
    .regex(/^\+?[0-9]+$/, 'Chiffres uniquement'),
})
type CheckoutValues = z.infer<typeof checkoutSchema>

const statusLabels: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  SUCCESSFUL: { label: 'Payé', variant: 'success' },
  FAILED: { label: 'Échec', variant: 'error' },
  EXPIRED: { label: 'Expiré', variant: 'neutral' },
}

const MAX_POLL_ATTEMPTS = 40
const POLL_INTERVAL_MS = 1500

function formatAmount(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function SubscriptionSection() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<StartedPayment | null>(null)
  const [formPlan, setFormPlan] = useState<PublicPlan | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const attemptsRef = useRef(0)

  const subQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: getMySubscription,
  })
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: listPlans })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { network: 'mtn', phoneNumber: '' },
  })

  const checkoutMutation = useMutation({
    mutationFn: startCheckout,
    onSuccess: (data) => {
      attemptsRef.current = 0
      setPending(data.payment)
      setFormPlan(null)
      reset()
      if (data.providerLink) {
        window.open(data.providerLink, '_blank', 'noopener,noreferrer')
        setNotice({
          type: 'success',
          text: 'Validez le paiement sur la page qui vient de s’ouvrir, puis attendez la confirmation.',
        })
      } else {
        setNotice(null)
      }
    },
    onError: (err) =>
      setNotice({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Le paiement n’a pas pu être initialisé',
      }),
  })

  const downgradeMutation = useMutation({
    mutationFn: downgradeToFree,
    onSuccess: () => {
      setNotice({ type: 'success', text: 'Votre compte est repassé en plan gratuit.' })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
    onError: (err) =>
      setNotice({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Le changement de plan a échoué',
      }),
  })

  // Sondage du statut de paiement (SebPay ou simulation)
  useEffect(() => {
    if (!pending || pending.status !== 'PENDING') return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const { payment } = await getPaymentStatus(pending.id)
        if (cancelled) return
        if (payment.status === 'SUCCESSFUL') {
          setPending(null)
          setNotice({ type: 'success', text: `Paiement confirmé — plan ${payment.planName} activé !` })
          queryClient.invalidateQueries({ queryKey: ['subscription'] })
        } else if (payment.status === 'FAILED') {
          setPending(null)
          setNotice({
            type: 'error',
            text: payment.failureReason ?? 'Le paiement a été refusé. Vérifiez votre numéro et réessayez.',
          })
        } else {
          attemptsRef.current += 1
          if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
            setPending(null)
            setNotice({
              type: 'success',
              text: 'Paiement en cours de traitement : il sera confirmé automatiquement, revenez d’ici quelques minutes.',
            })
            queryClient.invalidateQueries({ queryKey: ['subscription'] })
          } else {
            setPending(payment)
          }
        }
      } catch {
        if (!cancelled) setPending(pending)
      }
    }, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [pending, queryClient])

  const onSubmit = (values: CheckoutValues) => {
    if (!formPlan) return
    checkoutMutation.mutate({ planId: formPlan.id, ...values })
  }

  const state = subQuery.data
  const plans = plansQuery.data?.plans ?? []
  const currentCode = state?.planCode ?? 'FREE'
  const subscription = state?.subscription
  const errorMessage =
    checkoutMutation.error instanceof ApiError
      ? checkoutMutation.error.message
      : checkoutMutation.error
        ? 'Une erreur est survenue'
        : null

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Abonnement</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gérez votre plan : le prix affiché est celui en vigueur, prélevé par mobile money.
          </p>
        </div>
        <Link to="/tarifs">
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4" aria-hidden />
            Comparer les plans
          </Button>
        </Link>
      </div>

      {state?.mock ? (
        <Alert variant="info" className="mt-4">
          Mode démonstration : les paiements sont simulés (aucun débit réel). Configurez vos clés SebPay
          dans le serveur pour activer les paiements MTN MoMo et Orange Money.
        </Alert>
      ) : null}

      {notice ? (
        <Alert variant={notice.type} className="mt-4">
          {notice.text}
        </Alert>
      ) : null}

      {pending ? (
        <Card className="mt-4 flex items-center gap-3 border-primary/40 p-5">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          <div className="text-sm">
            <p className="font-medium text-text-primary">
              Validation du paiement {formatAmount(pending.amount)} en cours…
            </p>
            <p className="text-text-secondary">
              Confirmez la demande sur votre téléphone
              {pending.network ? ` (${pending.network === 'orange' ? 'Orange Money' : 'MTN MoMo'})` : ''}. Cette
              page se met à jour automatiquement.
            </p>
          </div>
        </Card>
      ) : null}

      {/* Plan courant */}
      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Plan actuel</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-extrabold text-text-primary">
                {state?.plan?.name ?? currentCode}
              </span>
              <Badge variant={currentCode === 'FREE' ? 'neutral' : 'success'}>
                {currentCode === 'FREE' ? 'Gratuit' : 'Actif'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {state?.plan ? (
                <>
                  {formatAmount(state.plan.price)}
                  {state.plan.durationDays > 0 ? ' / mois' : ' — sans limite de durée'}
                </>
              ) : (
                'Plan de découverte, gratuit'
              )}
            </p>
            {subscription ? (
              <p className="mt-1 text-sm text-text-secondary">
                {subscription.status === 'ACTIVE' ? (
                  subscription.daysLeft !== undefined ? (
                    <>Expire dans <span className="font-semibold text-text-primary">{subscription.daysLeft} jours</span></>
                  ) : (
                    <>Débuté le {formatDate(subscription.startDate)} — sans expiration</>
                  )
                ) : (
                  <>Abonnement {subscription.status === 'EXPIRED' ? 'expiré' : 'résilié'}</>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-text-secondary">Aucun paiement en cours.</p>
            )}
          </div>

          {currentCode !== 'FREE' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downgradeMutation.mutate()}
              disabled={downgradeMutation.isPending}
            >
              <Wallet className="h-4 w-4" aria-hidden />
              {downgradeMutation.isPending ? 'Traitement…' : 'Passer au plan FREE'}
            </Button>
          ) : null}
        </div>
      </Card>

      {/* Catalogue */}
      <h2 className="mt-6 text-base font-semibold text-text-primary">Changer de plan</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentCode
          return (
            <Card
              key={plan.id}
              className={`flex flex-col p-5 ${plan.highlight ? 'border-primary ring-1 ring-primary/30' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-text-primary">{plan.name}</span>
                {plan.highlight ? <Badge variant="promo">Le plus choisi</Badge> : null}
                {isCurrent ? <Badge variant="success">Actuel</Badge> : null}
              </div>
              <p className="mt-2">
                <span className="text-2xl font-extrabold text-text-primary">{formatAmount(plan.price)}</span>
                <span className="text-sm text-text-muted">{plan.durationDays > 0 ? ' / mois' : ''}</span>
              </p>
              <ul className="mt-3 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {plan.price <= 0 || isCurrent ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    {isCurrent ? 'Plan actuel' : 'Inclus avec votre compte'}
                  </Button>
                ) : formPlan?.id === plan.id ? (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
                    <FormField
                      label="Réseau mobile money"
                      htmlFor={`checkout-network-${plan.id}`}
                      error={errors.network?.message}
                    >
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Réseau mobile money">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-sm font-medium text-text-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-light has-[:checked]:text-primary">
                          <input
                            type="radio"
                            value="mtn"
                            id={`checkout-network-${plan.id}`}
                            className="sr-only"
                            {...register('network')}
                          />
                          MTN MoMo
                        </label>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-sm font-medium text-text-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-light has-[:checked]:text-primary">
                          <input type="radio" value="orange" className="sr-only" {...register('network')} />
                          Orange Money
                        </label>
                      </div>
                    </FormField>
                    <FormField
                      label="Numéro à débiter"
                      htmlFor={`checkout-phone-${plan.id}`}
                      error={errors.phoneNumber?.message}
                      hint="Ex : 699 99 99 99 — vous recevrez une demande de confirmation."
                    >
                      <input
                        id={`checkout-phone-${plan.id}`}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="699999999"
                        className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                        {...register('phoneNumber')}
                      />
                    </FormField>
                    {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1" loading={isSubmitting}>
                        Payer {formatAmount(plan.price)}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFormPlan(null)}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => setFormPlan(plan)}>
                    <Smartphone className="h-4 w-4" aria-hidden />
                    Choisir {plan.name}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Historique */}
      <h2 className="mt-6 text-base font-semibold text-text-primary">Historique des paiements</h2>
      {state && state.payments.length > 0 ? (
        <Card className="mt-3 divide-y divide-border">
          {state.payments.map((payment) => {
            const status = statusLabels[payment.status]
            return (
              <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="text-sm">
                  <p className="font-medium text-text-primary">
                    {payment.planName || payment.planCode}{' '}
                    <span className="font-normal text-text-muted">— {formatAmount(payment.amount)}</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(payment.createdAt)}
                    {payment.network ? ` · ${payment.network === 'orange' ? 'Orange Money' : 'MTN MoMo'}` : ''}
                    {payment.failureReason ? ` · ${payment.failureReason}` : ''}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            )
          })}
        </Card>
      ) : (
        <Card className="mt-3 p-5 text-sm text-text-muted">
          Aucun paiement pour le moment.
        </Card>
      )}
    </div>
  )
}
