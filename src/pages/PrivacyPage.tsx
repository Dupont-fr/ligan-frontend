import { Lock, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'

const sections = [
  {
    id: 'responsable',
    title: '1. Qui est responsable ?',
    paras: [
      'LIGAN+ édite la plateforme et détermine les traitements décrits ci-dessus. Toute demande relative à vos données peut être envoyée depuis la page Contact.',
    ],
  },
  {
    id: 'collecte',
    title: '2. Données collectées',
    paras: [
      'Compte : adresse e-mail, mot de passe (stocké sous forme chiffrée), rôle et date de vérification de l’e-mail.',
      'Professionnel : informations de fiche publique (nom, présentation, activités, tarifs indicatifs, zone d’intervention, photographies éventuelles) et coordonnées que vous choisissez de publier.',
      'Utilisation : sollicitations et messages échangés sur la plateforme, avis publiés, historique de vos actions nécessaires au service.',
      'Technique : données de navigation transmises par votre navigateur (adresse IP, type d’appareil) utilisées pour la sécurité et la prévention des abus. La géolocalisation n’est demandée qu’avec votre accord et uniquement pour classer les résultats par distance.',
      'Paiement : pour les plans professionnels, les transactions sont traitées par notre prestataire de paiement. LIGAN+ ne conserve ni numéro de carte bancaire ni code secret.',
    ],
  },
  {
    id: 'finalites',
    title: '3. Pourquoi ?',
    paras: [
      'Fournir le service (comptes, fiches, recherche, sollicitations, avis), envoyer les e-mails utiles (vérification, notifications, réinitialisation de mot de passe), assurer la sécurité de la plateforme et la modération des contenus, et mesurer l’audience de façon agrégée.',
    ],
  },
  {
    id: 'sous-traitants',
    title: '4. Avec qui ?',
    paras: [
      'Des sous-traitants techniques strictement nécessaires : hébergement et base de données, service d’envoi d’e-mails (Brevo), prestataire de paiement mobile money (SebPay). Vos données ne sont ni vendues, ni louées, ni cédées à des fins publicitaires.',
      'Elles peuvent être communiquées aux autorités si la loi l’exige.',
    ],
  },
  {
    id: 'conservation',
    title: '5. Combien de temps ?',
    paras: [
      'Les données de compte sont conservées jusqu’à la suppression du compte, réalisable depuis votre espace (section Mon compte) ou sur demande depuis la page Contact. Les messages et avis restent liés à l’activité du service. Les journaux de sécurité sont conservés pendant une durée limitée, puis supprimés ou anonymisés.',
    ],
  },
  {
    id: 'securite',
    title: '6. Sécurité',
    paras: [
      'Mots de passe chiffrés, échanges en HTTPS, limitation du nombre de tentatives de connexion, accès administrateur restreint et journalisé, modération des contenus publiés : ces mesures protègent vos données contre l’accès non autorisé.',
    ],
  },
  {
    id: 'cookies',
    title: '7. Cookies et stockage local',
    paras: [
      'La plateforme utilise le stockage local de votre navigateur pour mémoriser votre thème d’affichage (clair/sombre) et votre session. Aucun cookie de publicité ciblée n’est déposé.',
    ],
  },
  {
    id: 'droits',
    title: '8. Vos droits',
    paras: [
      'Vous disposez d’un droit d’accès, de rectification et de suppression de vos données. La suppression du compte est auto-service depuis votre espace ; pour une copie de vos données ou toute autre demande, écrivez-nous depuis la page Contact. Vous pouvez retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.',
    ],
  },
  {
    id: 'modifications',
    title: '9. Évolution de cette politique',
    paras: [
      'Cette politique peut évoluer pour refléter les changements de la plateforme ou de la réglementation. La version en vigueur est celle publiée sur cette page, avec sa date de mise à jour.',
    ],
  },
]

export function PrivacyPage() {
  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:py-14">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Vie privée
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Politique de confidentialité
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              Mise à jour : octobre 2026 — vos données, vos droits, en clair.
            </p>
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 lg:grid-cols-4">
          {/* Sommaire */}
          <nav aria-label="Sommaire" className="lg:col-span-1">
            <div className="sticky top-20 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Sommaire
              </p>
              <ul className="space-y-1.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-text-secondary transition-colors hover:text-primary"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Contenu */}
          <article className="space-y-8 lg:col-span-3">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-text-secondary">
                  {section.paras.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-success/30 bg-success-light px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <p className="text-sm text-text-primary">
                Une question sur vos données ?{' '}
                <Link to="/contact" className="font-medium text-primary hover:underline">
                  Contactez-nous
                </Link>{' '}
                — nous répondons sous 24 à 48 heures ouvrées.
              </p>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
