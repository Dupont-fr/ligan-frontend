import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, CreditCard, Loader2, Smartphone, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
  listPaymentOperators,
  startCheckout,
  type PaymentStatus,
  type StartedPayment,
} from '../../services/subscriptions'

const checkoutSchema = z.object({
  network: z.string().min(1, 'Choisissez un opérateur'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{9}$/, 'Le numéro doit contenir 9 chiffres'),
  otpCode: z
    .union([z.string().trim().regex(/^\d{4,12}$/, 'Code OTP invalide (4 à 12 chiffres)'), z.literal('')])
    .optional(),
})
type CheckoutValues = z.infer<typeof checkoutSchema>

const statusLabels: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  SUCCESSFUL: { label: 'Payé', variant: 'success' },
  FAILED: { label: 'Échec', variant: 'error' },
  EXPIRED: { label: 'Expiré', variant: 'neutral' },
}

const MAX_POLL_ATTEMPTS = 60
// 3 s × 60 = 3 min de scrutation : une confirmation mobile money peut prendre
// plus de 2 minutes (le client doit valider la demande sur son téléphone).
const POLL_INTERVAL_MS = 3000
/**
 * Délai avant de rejouer une collecte refusée par l'opérateur. Enchaîner les
 * demandes fait grimper le risque de blocage côté opérateur (anti-fraude) sans
 * changer le résultat : on espace donc les tentatives.
 */
const RETRY_COOLDOWN_SECONDS = 60

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
  const [retryAfter, setRetryAfter] = useState(0)
  const attemptsRef = useRef(0)

  const subQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: getMySubscription,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false
      return failureCount < 2
    },
  })
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: listPlans })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { network: '', phoneNumber: '', otpCode: '' },
  })

  const operatorsQuery = useQuery({
    queryKey: ['payment-operators'],
    queryFn: listPaymentOperators,
    staleTime: 60 * 60 * 1000,
  })
  const operators = operatorsQuery.data?.operators ?? []
  const selectedNetwork = useWatch({ control, name: 'network' })
  const selectedOperator = operators.find((op) => op.slug === selectedNetwork)
  const otpRequired = selectedOperator?.otpRequired === true
  const operatorLabel = (slug: string | null) =>
    slug ? (operators.find((op) => op.slug === slug)?.name ?? slug) : ''

  const checkoutMutation = useMutation({
    mutationFn: startCheckout,
    onSuccess: (data: any) => {
      if (data.restored) {
        setFormPlan(null)
        reset()
        setNotice({ type: 'success', text: 'Votre abonnement précédent a été restauré sans paiement.' })
        queryClient.invalidateQueries({ queryKey: ['subscription'] })
        return
      }
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
    onError: (err) => {
      // Collecte refusée par l'opérateur : on espace les tentatives suivantes.
      setRetryAfter(RETRY_COOLDOWN_SECONDS)
      setNotice({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Le paiement n’a pas pu être initialisé',
      })
    },
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

  // Décompte du délai avant de rejouer une collecte refusée.
  useEffect(() => {
    if (retryAfter <= 0) return
    const timer = setTimeout(() => setRetryAfter((value) => Math.max(0, value - 1)), 1000)
    return () => clearTimeout(timer)
  }, [retryAfter])

  const onSubmit = (values: CheckoutValues) => {
    if (!formPlan) return
    const otpCode = values.otpCode?.trim() ?? ''
    if (otpRequired && !otpCode) {
      setError('otpCode', { message: 'Saisissez le code OTP reçu sur votre téléphone' })
      return
    }
    checkoutMutation.mutate({ planId: formPlan.id, ...values, otpCode: otpCode || undefined })
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
              {pending.network ? ` (${operatorLabel(pending.network)})` : ''}. Cette
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
          ) : state?.canRestore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const proPlan = plans.find((p) => p.code === 'PRO') ?? plans.find((p) => p.price > 0)
                if (proPlan) {
                  setFormPlan(proPlan)
                  setNotice({
                    type: 'success',
                    text: state.previousPlanEndsAt
                      ? `Vous pouvez restaurer votre abonnement jusqu'au ${formatDate(state.previousPlanEndsAt)} sans repayer.`
                      : 'Votre abonnement précédent est encore valide et peut être restauré sans repayer.',
                  })
                } else {
                  setNotice({ type: 'error', text: 'Aucun plan payant disponible pour restauration.' })
                }
              }}
            >
              <CreditCard className="h-4 w-4" aria-hidden />
              Restaurer mon abonnement
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
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Opérateur mobile money">
                        {operators.length === 0 ? (
                          <p className="col-span-2 text-sm text-text-secondary">Opérateurs indisponibles, réessayez.</p>
                        ) : (
                          operators.map((op, index) => (
                            <label
                              key={op.slug}
                              className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-sm font-medium text-text-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-light has-[:checked]:text-primary"
                            >
                              <input
                                type="radio"
                                value={op.slug}
                                id={`checkout-network-${plan.id}-${index}`}
                                className="sr-only"
                                {...register('network')}
                              />
                              {op.name}
                            </label>
                          ))
                        )}
                      </div>
                    </FormField>
                    <FormField
                      label="Numéro à débiter"
                      htmlFor={`checkout-phone-${plan.id}`}
                      error={errors.phoneNumber?.message}
                      hint="9 chiffres — vous recevrez une demande de confirmation."
                    >
                      <input
                        id={`checkout-phone-${plan.id}`}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={9}
                        placeholder="699999999"
                        className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                        {...register('phoneNumber')}
                      />
                    </FormField>
                    {otpRequired ? (
                      <FormField
                        label="Code OTP"
                        htmlFor={`checkout-otp-${plan.id}`}
                        error={errors.otpCode?.message}
                        hint={
                          selectedOperator?.ussdCode
                            ? `Composez ${selectedOperator.ussdCode} sur votre téléphone pour recevoir le code, puis saisissez-le ici.`
                            : 'Saisissez le code de confirmation reçu sur votre téléphone.'
                        }
                      >
                        <input
                          id={`checkout-otp-${plan.id}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={12}
                          placeholder="123456"
                          className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                          {...register('otpCode')}
                        />
                      </FormField>
                    ) : null}
                    {errorMessage ? (
                      <Alert variant="error">
                        {errorMessage}
                        <span className="mt-1 block text-xs">
                          Astuce : vérifiez que le numéro est bien rattaché à l’opérateur choisi et que le
                          compte mobile money est provisionné. Vous pouvez changer d’opérateur ci-dessus.
                        </span>
                      </Alert>
                    ) : null}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="flex-1"
                        loading={checkoutMutation.isPending}
                        disabled={checkoutMutation.isPending || retryAfter > 0}
                      >
                        {checkoutMutation.isPending
                          ? 'Initialisation…'
                          : retryAfter > 0
                            ? `Réessayer dans ${retryAfter} s`
                            : `Payer ${formatAmount(plan.price)}`}
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
                    {payment.network ? ` · ${operatorLabel(payment.network)}` : ''}
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
