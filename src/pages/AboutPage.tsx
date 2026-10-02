import { ArrowRight, Handshake, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Button } from '../components/ui/Button'

const values = [
  {
    icon: MapPin,
    title: 'Proximité',
    text: 'Un professionnel de votre quartier vaut mieux qu’un catalogue national. La géolocalisation remet le local au centre.',
  },
  {
    icon: ShieldCheck,
    title: 'Confiance',
    text: 'Comptes confirmés par e-mail, contenus modérés, avis publiés après vérification : chacun assume son identité.',
  },
  {
    icon: Sparkles,
    title: 'Simplicité',
    text: 'Pas de jargon, pas de parcours interminable. Cherchez, comparez, contactez — en trois gestes, sur mobile.',
  },
]

const steps = [
  {
    n: '1',
    title: 'Cherchez',
    text: 'Une catégorie, un mot-clé ou votre position suffisent pour voir les professionnels disponibles autour de vous.',
  },
  {
    n: '2',
    title: 'Comparez',
    text: 'Chaque fiche présente les activités, les tarifs indicatifs, la zone d’intervention et les avis des clients.',
  },
  {
    n: '3',
    title: 'Contactez',
    text: 'Vous envoyez un message directement au professionnel, qui vous répond sans intermédiaire.',
  },
]

export function AboutPage() {
  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <Handshake className="h-3.5 w-3.5" aria-hidden />
              Notre histoire
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Trouvez les professionnels <span className="text-secondary">près de vous</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
              LIGAN+ est née d’un constat simple : trouver un bon artisan, coiffeur ou professeur
              dans son quartier relève encore de la bouche-à-oreille. Nous organisons ce
              bouche-à-oreille pour le rendre utile à tout le monde.
            </p>
          </div>
        </section>

        {/* Notre histoire */}
        <section className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed text-text-secondary">
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
            Pourquoi LIGAN+ existe
          </h2>
          <p>
            Partout au Cameroun, les professionnels de proximité vivent de recommandations :
            un voisin qui appelle, un groupe qui suggère, un affiche déchirée au coin de la
            rue. Cela fonctionne — mais ça ne scale pas, et ça laisse dans l’ombre les
            travailleurs sérieux qui n’ont pas de réseau.
          </p>
          <p>
            LIGAN+ donne à ces professionnels une fiche visible, à jour et consultable sans
            compte, et donne aux clients un endroit unique pour comparer et contacter. La
            plateforme est pensée <strong className="text-text-primary">mobile d’abord</strong>,
            parce que c’est sur le téléphone que tout se joue.
          </p>
          <p>
            Notre modèle est volontairement clair : la recherche et la consultation restent
            gratuites pour les clients ; les professionnels démarrent gratuitement et
            choisissent s’ils veulent plus de visibilité avec nos plans
            (<Link to="/tarifs" className="font-medium text-primary hover:underline">
              voir les tarifs
            </Link>
            ). Pas de commission cachée sur vos échanges.
          </p>
        </section>

        {/* Valeurs */}
        <section className="border-y border-border bg-surface py-10">
          <div className="mx-auto w-full max-w-5xl px-4">
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">Nos valeurs</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-[var(--radius-md)] border border-border bg-background p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                    <value.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-text-primary">{value.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">Comment ça marche</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.n}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-contrast">
                  {step.n}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-surface py-10">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 text-center">
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
              Vous êtes professionnel ?
            </h2>
            <p className="max-w-xl text-sm text-text-secondary">
              Créez votre fiche gratuitement, publiez vos activités et recevez des demandes de
              clients de votre quartier.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/register?role=PROFESSIONAL">
                <Button size="lg">
                  Devenir professionnel
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link to="/trouver">
                <Button variant="outline" size="lg">
                  <Search className="h-4 w-4" aria-hidden />
                  Chercher un pro
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
