import { ArrowRight, CheckCircle2, Clock, MessagesSquare, Search, ShieldCheck, Star, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Button } from '../components/ui/Button'
import { CATEGORIES } from '../lib/categories'

const steps = [
  {
    icon: Search,
    title: 'Recherchez',
    text: 'Dites-nous ce dont vous avez besoin : métier, catégorie ou mot-clé.',
  },
  {
    icon: MessagesSquare,
    title: 'Comparez',
    text: 'Parcourez les activités publiées par les pros locaux : tarifs, zone, description.',
  },
  {
    icon: CheckCircle2,
    title: 'Sollicitez',
    text: 'Envoyez un message en 1 clic et obtenez une réponse directe du professionnel.',
  },
]

const trustPoints = [
  { icon: ShieldCheck, title: 'Pros vérifiés', text: 'Chaque compte est validé par email.' },
  { icon: Star, title: 'Activités à jour', text: 'Les pros publient et gèrent leurs services.' },
  { icon: Clock, title: 'Réponses rapides', text: 'Contact direct, sans intermédiaire.' },
]

export function LandingPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/trouver?q=${encodeURIComponent(q)}` : '/trouver')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center sm:py-20">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
              La plateforme locale de confiance
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
              Trouvez le bon pro, <span className="text-primary">près de chez vous</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
              Mécaniciens, plombiers, coiffeurs, cours particuliers… Ligan+ relie les clients aux
              professionnels locaux, simplement et gratuitement.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 shadow-[var(--shadow-sm)]">
                <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Que recherchez-vous ? (ex : mécanicien)"
                  aria-label="Rechercher un professionnel"
                  className="h-12 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
              <Button type="submit" size="lg">
                Rechercher
              </Button>
            </form>

            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Gratuit pour chercher
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Sans compte pour consulter
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Contact direct
              </span>
            </div>
          </div>
        </section>

        {/* Catégories — inspiré Jumia */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="categories-title">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 id="categories-title" className="text-xl font-bold text-text-primary sm:text-2xl">
                Explorez par catégorie
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Des dizaines de métiers, un seul canal : le <span className="font-semibold text-primary">+</span>
              </p>
            </div>
            <Link to="/trouver" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">
              Tout voir <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/trouver?categorie=${encodeURIComponent(cat.label)}`}
                className="group flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-sm)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <cat.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-medium leading-snug text-text-secondary group-hover:text-text-primary">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Comment ça marche — inspiré Angi */}
        <section id="how" className="border-y border-border bg-surface py-14" aria-labelledby="how-title">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="text-center">
              <h2 id="how-title" className="text-xl font-bold text-text-primary sm:text-2xl">
                Comment ça marche&nbsp;?
              </h2>
              <p className="mt-2 text-sm text-text-secondary">Trois étapes, zéro friction.</p>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="mt-4 flex justify-center">
                    <step.icon className="h-6 w-6 text-primary" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confiance */}
        <section className="mx-auto w-full max-w-6xl px-4 py-14">
          <div className="grid gap-6 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-light text-primary">
                  <point.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{point.title}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Pros — inspiré Angi for professionals */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16">
          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-r from-primary to-primary-hover px-6 py-10 text-center sm:px-12">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <UserRound className="h-6 w-6 text-white" aria-hidden />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Vous êtes professionnel&nbsp;?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/85 sm:text-base">
              Créez votre compte pro, publiez vos activités, voyez celles des autres pros et
              sollicitez leurs services quand vous en avez besoin.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register?role=PROFESSIONAL">
                <Button size="lg" variant="outline" className="border-white/40 bg-white text-primary hover:bg-white/90">
                  Créer un compte pro
                </Button>
              </Link>
              <Link to="/trouver">
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  Parcourir les pros
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
