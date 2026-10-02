import { ArrowRight, ChevronDown, CreditCard, LifeBuoy, Search, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Card } from '../components/ui/Card'

interface FaqItem {
  q: string
  a: string
}

const faqGroups: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Compte et connexion',
    items: [
      {
        q: 'Dois-je créer un compte pour utiliser LIGAN+ ?',
        a: 'Non. Consulter les catégories, les fiches professionnelles et les avis est gratuit et sans compte. Un compte est seulement nécessaire pour contacter un professionnel ou gérer votre espace.',
      },
      {
        q: 'Comment créer mon compte ?',
        a: 'Depuis « Créer un compte », avec une adresse e-mail et un mot de passe. Vous recevez un e-mail de vérification : cliquez sur le lien pour activer votre compte.',
      },
      {
        q: 'Je n’ai pas reçu l’e-mail de vérification.',
        a: 'Regardez vos spams, puis connectez-vous pour renvoyer le code depuis la page de connexion. Le problème persiste ? Contactez-nous depuis la page Contact.',
      },
      {
        q: 'J’ai oublié mon mot de passe.',
        a: 'Utilisez « Mot de passe oublié » sur la page de connexion : vous recevrez un lien pour en définir un nouveau.',
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: 'Depuis votre espace, section Mon compte : la suppression est définitive et efface vos données personnelles.',
      },
    ],
  },
  {
    title: 'Recherche et clients',
    items: [
      {
        q: 'Comment trouver un professionnel près de moi ?',
        a: 'Allez dans « Trouver un pro », cherchez par métier ou mot-clé, et activez la géolocalisation pour voir les professionnels triés par distance autour de votre position.',
      },
      {
        q: 'Comment contacter un professionnel ?',
        a: 'Ouvrez sa fiche, vérifiez ses activités et sa zone d’intervention, puis envoyez-lui un message : il reçoit votre sollicitation et vous répond directement.',
      },
      {
        q: 'Puis-je laisser un avis ?',
        a: 'Oui, si vous avez un compte client. Les avis sont relus avant publication afin de garantir des retours sincères et respectueux.',
      },
    ],
  },
  {
    title: 'Professionnels, plans et paiements',
    items: [
      {
        q: 'Comment devenir professionnel sur LIGAN+ ?',
        a: 'Inscrivez-vous avec le rôle professionnel, confirmez votre e-mail, puis suivez l’assistant de création de fiche : activité, tarif, zone d’intervention. La fiche est gratuite.',
      },
      {
        q: 'Les plans, ça marche comment ?',
        a: 'Le plan FREE est gratuit et illimité. Les plans payants (PRO, PREMIUM) ajoutent de la visibilité à votre fiche. Le détail est sur la page Tarifs, les prix sont toujours affichés avant paiement.',
      },
      {
        q: 'Comment payer un plan ?',
        a: 'Par mobile money (MTN MoMo ou Orange Money) : vous confirmez la demande reçue sur votre téléphone et le plan s’active aussitôt dans votre espace.',
      },
      {
        q: 'Puis-je revenir au plan gratuit ?',
        a: 'Oui, à tout moment depuis votre espace pro : aucun engagement de durée, le retour au plan FREE est immédiat.',
      },
      {
        q: 'Où suivre mes demandes de clients ?',
        a: 'Dans votre espace pro, section Sollicitations : chaque message reçu, avec la réponse à apporter.',
      },
    ],
  },
]

export function HelpPage() {
  const [openId, setOpenId] = useState<string | null>('0-0')

  const quickLinks = [
    {
      icon: UserRound,
      title: 'Devenir professionnel',
      text: 'Créez votre fiche en quelques minutes.',
      to: '/register?role=PROFESSIONAL',
    },
    {
      icon: CreditCard,
      title: 'Tarifs et plans',
      text: 'Comparez FREE, PRO et PREMIUM.',
      to: '/tarifs',
    },
    {
      icon: LifeBuoy,
      title: 'Nous contacter',
      text: 'Une question précise ? Écrivez-nous.',
      to: '/contact',
    },
  ]

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
              Centre d’aide
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Comment pouvons-nous <span className="text-secondary">vous aider</span> ?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
              Les réponses aux questions les plus fréquentes sur les comptes, la recherche, les
              plans et les paiements.
            </p>
          </div>
        </section>

        {/* Accès rapides */}
        <section className="mx-auto grid w-full max-w-5xl gap-3 px-4 py-8 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.to}>
              <Card className="h-full p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-md)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                  <link.icon className="h-4 w-4" aria-hidden />
                </span>
                <h2 className="mt-2.5 text-sm font-semibold text-text-primary">{link.title}</h2>
                <p className="mt-1 text-sm text-text-secondary">{link.text}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Ouvrir <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-4 pb-10">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
              Questions fréquentes
            </h2>
          </div>

          <div className="mt-5 space-y-8">
            {faqGroups.map((group, gi) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  {group.title}
                </h3>
                <div className="mt-2 divide-y divide-border rounded-[var(--radius-md)] border border-border bg-surface">
                  {group.items.map((item, ii) => {
                    const id = `${gi}-${ii}`
                    const isOpen = openId === id
                    return (
                      <div key={item.q}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                        >
                          <span className="text-sm font-medium text-text-primary">{item.q}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
                              isOpen ? 'rotate-180 text-primary' : ''
                            }`}
                            aria-hidden
                          />
                        </button>
                        {isOpen ? (
                          <p className="px-4 pb-4 text-sm leading-relaxed text-text-secondary">
                            {item.a}
                          </p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA contact */}
        <section className="border-t border-border bg-surface py-10">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 text-center">
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
              Vous n’avez pas trouvé votre réponse ?
            </h2>
            <p className="max-w-xl text-sm text-text-secondary">
              Notre équipe vous répond sous 24 à 48 heures ouvrées.
            </p>
            <Link to="/contact">
              <span className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-5 text-sm font-semibold text-primary-contrast transition-opacity hover:opacity-90">
                Contacter l’équipe
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
