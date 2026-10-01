import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ChevronDown, CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/AuthContext'
import { listPlans, type PublicPlan } from '../services/plans'

function formatAmount(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

const faq = [
  {
    q: 'Comment payer ?',
    a: 'Par mobile money : MTN MoMo ou Orange Money. Vous confirmez la demande reçue sur votre téléphone, le plan s’active aussitôt.',
  },
  {
    q: 'Le plan FREE, vraiment gratuit ?',
    a: 'Oui, 0 FCFA, sans limite de durée. Votre fiche professionnelle reste publique et accessible.',
  },
  {
    q: 'Puis-je changer de plan ?',
    a: 'Oui, à tout moment depuis votre espace pro : le nouveau plan s’active après paiement, et vous pouvez revenir au plan FREE.',
  },
]

function planCardAction(plan: PublicPlan, isAuthenticated: boolean, isPro: boolean, navigate: ReturnType<typeof useNavigate>) {
  if (plan.price <= 0) {
    return isAuthenticated ? (
      <Button variant="outline" size="lg" className="w-full" onClick={() => navigate(isPro ? '/dashboard' : '/register?role=PROFESSIONAL')}>
        Commencer gratuitement
      </Button>
    ) : (
      <Link to="/register?role=PROFESSIONAL" className="w-full">
        <Button variant="outline" size="lg" className="w-full">
          Créer mon compte
        </Button>
      </Link>
    )
  }
  if (isPro) {
    return (
      <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
        Choisir {plan.name}
      </Button>
    )
  }
  return (
    <Link to="/register?role=PROFESSIONAL" className="w-full">
      <Button size="lg" className="w-full">
        Choisir {plan.name}
      </Button>
    </Link>
  )
}

export function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const isPro = user?.role === 'PROFESSIONAL'

  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: listPlans })
  const plans = plansQuery.data?.plans ?? []

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Pour les professionnels de LIGAN+
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Un tarif simple, <span className="text-secondary">à chaque étape</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
              Publiez vos services gratuitement, passez au niveau supérieur quand vous voulez. Paiement
              sécurisé par mobile money, résiliable à tout moment.
            </p>
          </div>
        </section>

        {/* Cartes de plans */}
        <section className="mx-auto w-full max-w-5xl px-4 py-10" aria-label="Plans d’abonnement">
          {plansQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-96 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-[var(--radius-md)] border bg-surface p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${
                    plan.highlight ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                  }`}
                >
                  {plan.highlight ? (
                    <Badge variant="promo" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Le plus choisi
                    </Badge>
                  ) : null}

                  <h2 className="text-base font-bold text-text-primary">{plan.name}</h2>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-text-primary">
                      {formatAmount(plan.price)}
                    </span>
                    <span className="text-sm text-text-muted">
                      {plan.durationDays > 0 ? '/ mois' : plan.price > 0 ? '' : 'pour toujours'}
                    </span>
                  </p>
                  {plan.price > 0 && plan.durationDays > 0 ? (
                    <p className="mt-1 text-xs text-text-muted">Soit {formatAmount(plan.price)} par mois, sans engagement.</p>
                  ) : null}

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">{planCardAction(plan, Boolean(user), isPro, navigate)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-success" aria-hidden />
              Paiement mobile money sécurisé
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
              Sans engagement, résiliable en un clic
            </span>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-surface py-12" aria-labelledby="faq-title">
          <div className="mx-auto w-full max-w-3xl px-4">
            <h2 id="faq-title" className="text-center text-xl font-bold text-text-primary sm:text-2xl">
              Questions fréquentes
            </h2>
            <div className="mt-6 divide-y divide-border rounded-[var(--radius-md)] border border-border bg-background">
              {faq.map((item, i) => {
                const open = openFaq === i
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                      aria-expanded={open}
                    >
                      <span className="text-sm font-semibold text-text-primary">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <p className="px-4 pb-4 text-sm leading-relaxed text-text-secondary">{item.a}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/register?role=PROFESSIONAL"
                className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Pas encore de compte pro ? Créez-le gratuitement →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
