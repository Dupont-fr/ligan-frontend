import { Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'

const sections = [
  {
    id: 'objet',
    title: '1. Objet',
    paras: [
      'Les présentes conditions générales d’utilisation (ci-après « les Conditions ») régissent l’accès et l’usage de la plateforme LIGAN+, éditée en ligne et accessible depuis le site et ses applications.',
      'LIGAN+ met en relation des clients à la recherche d’un professionnel de proximité (artisans, services à domicile, bien-être, soutien scolaire, etc.) et des professionnels qui publient leurs activités. La plateforme n’intervient pas en tant que prestataire des services conclus entre ces parties.',
    ],
  },
  {
    id: 'acces',
    title: '2. Accès au service',
    paras: [
      'La consultation des catégories, des fiches professionnelles et des avis est gratuite et ne nécessite pas de compte.',
      'La création d’un compte est gratuite et réservée aux personnes majeures disposant de la capacité juridique de s’engager. L’utilisateur s’engage à fournir des informations exactes et à les maintenir à jour.',
      'LIGAN+ s’efforce de rendre la plateforme disponible en permanence, sans garantir une disponibilité sans interruption. Des interruptions peuvent survenir pour maintenance ou mise à jour.',
    ],
  },
  {
    id: 'compte',
    title: '3. Compte et sécurité',
    paras: [
      'L’activation du compte passe par la vérification de l’adresse e-mail. L’utilisateur est responsable de la confidentialité de son mot de passe et de toute activité effectuée depuis son compte.',
      'Toute utilisation frauduleuse ou non autorisée doit être signalée sans délai depuis la page Contact. LIGAN+ peut suspendre un compte en cas de manquement aux présentes Conditions.',
    ],
  },
  {
    id: 'roles',
    title: '4. Rôles des utilisateurs',
    paras: [
      'Client : crée un compte, consulte les fiches, envoie des sollicitations aux professionnels et peut publier des avis.',
      'Professionnel : crée une fiche, publie ses activités (description, tarif indicatif, zone d’intervention) et répond aux sollicitations reçues.',
      'Administrateur : assure la modération de la plateforme (contenus, avis, comptes) dans le respect des présentes Conditions.',
    ],
  },
  {
    id: 'contenus',
    title: '5. Fiches et contenus publiés',
    paras: [
      'Le professionnel garantit l’exactitude des informations publiées et les droits sur les contenus qu’il dépose (textes, photos). Les contenus illicites, trompeurs ou portant atteinte aux droits de tiers sont interdits.',
      'Les fiches et contenus peuvent être relus ou modérés par LIGAN+, qui se réserve le droit de les refuser ou de les retirer sans préavis en cas de non-conformité.',
      'Sont notamment interdits : contenus contraires à la loi, à la morale ou aux bonnes mœurs, usurpation d’identité, publicité sans rapport avec l’activité, collecte de données personnelles hors cadre.',
    ],
  },
  {
    id: 'avis',
    title: '6. Avis',
    paras: [
      'Les avis doivent refléter une expérience réelle et rester respectueux. Les avis sont examinés avant publication et peuvent être refusés ou retirés s’ils contiennent des propos diffamatoires, publicitaires ou hors sujet.',
      'Un avis publié peut être demandé à sa suppression par son auteur depuis la page Contact.',
    ],
  },
  {
    id: 'paiements',
    title: '7. Plans et paiements',
    paras: [
      'LIGAN+ propose un plan gratuit (FREE) et des plans payants dont les prix, la durée et les avantages sont affichés sur la page Tarifs avant tout engagement. Les prix s’entendent en francs CFA (XAF), toutes taxes comprises.',
      'Le paiement des plans s’effectue par mobile money via un prestataire de paiement tiers. LIGAN+ ne conserve aucune donnée de carte bancaire ni code secret de transaction.',
      'Les plans payants sont souscrits pour la durée indiquée, sans reconduction automatique : à l’expiration, le compte professionnel repasse au plan FREE sauf nouvelle souscription. Le retour au plan FREE est possible à tout moment depuis l’espace pro.',
    ],
  },
  {
    id: 'responsabilite',
    title: '8. Responsabilité',
    paras: [
      'LIGAN+ est un intermédiaire technique : les relations contractuelles (prestation, prix, exécution, litiges) se nouent directement entre le client et le professionnel. LIGAN+ ne peut être tenu d’un manquement d’un tiers à ses obligations.',
      'L’utilisateur reste responsable de l’usage qu’il fait de la plateforme. LIGAN+ ne saurait être tenu responsable des dommages résultant d’une utilisation non conforme des services.',
    ],
  },
  {
    id: 'propriete',
    title: '9. Propriété intellectuelle',
    paras: [
      'La structure, la marque LIGAN+, les textes, graphismes et éléments logiciels de la plateforme sont protégés. Toute reproduction ou exploitation non autorisée est interdite.',
      'L’utilisateur concède à LIGAN+ la licence d’héberger et de diffuser les contenus qu’il publie, nécessaire au fonctionnement du service.',
    ],
  },
  {
    id: 'donnees',
    title: '10. Données personnelles',
    paras: [
      'Le traitement des données personnelles est décrit dans notre',
    ],
    link: { label: 'Politique de confidentialité', to: '/confidentialite' },
    tail: ', qui fait partie intégrante des présentes Conditions.',
  },
  {
    id: 'droit',
    title: '11. Droit applicable',
    paras: [
      'Les présentes Conditions sont soumises au droit camerounais. En cas de différend, les parties chercheront une solution amiable avant toute action contentieuse.',
    ],
  },
  {
    id: 'contact',
    title: '12. Contact et modification',
    paras: [
      'Toute question relative aux Conditions peut être adressée depuis la page Contact. Les Conditions peuvent être mises à jour : la version en vigueur est celle publiée sur cette page, avec sa date de mise à jour.',
    ],
  },
]

export function TermsPage() {
  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:py-14">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <Scale className="h-3.5 w-3.5" aria-hidden />
              Légal
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Conditions d’utilisation
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              Mise à jour : octobre 2026 — applicables à tout utilisateur de LIGAN+.
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
                  {section.paras.map((p, i) => (
                    <p key={p}>
                      {p}
                      {section.link && i === section.paras.length - 1 ? (
                        <>
                          {' '}
                          <Link
                            to={section.link.to}
                            className="font-medium text-primary hover:underline"
                          >
                            {section.link.label}
                          </Link>
                          {section.tail}
                        </>
                      ) : null}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <p className="border-t border-border pt-6 text-xs text-text-muted">
              Une question ?{' '}
              <Link to="/contact" className="font-medium text-primary hover:underline">
                Contactez-nous
              </Link>
              .
            </p>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
