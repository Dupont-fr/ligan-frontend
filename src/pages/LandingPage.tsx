import { ArrowRight, CheckCircle2, Clock, MessagesSquare, Search, ShieldCheck, Star, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/AuthContext'
import { useCategories } from '../hooks/useCategories'

const steps = [
  {
    icon: Search,
    title: 'Recherchez',
    text: 'Indiquez le métier ou le service recherché : une catégorie ou un mot-clé suffit.',
  },
  {
    icon: MessagesSquare,
    title: 'Comparez',
    text: "Consultez les activités publiées : tarif, zone d'intervention et description.",
  },
  {
    icon: CheckCircle2,
    title: 'Contactez',
    text: 'Envoyez un message au professionnel et recevez sa réponse directement.',
  },
]

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Professionnels vérifiés',
    text: 'Chaque compte est confirmé par la validation de son adresse email.',
  },
  {
    icon: Star,
    title: 'Activités à jour',
    text: 'Les professionnels publient et mettent à jour eux-mêmes leurs services.',
  },
  {
    icon: Clock,
    title: 'Réponses rapides',
    text: 'Vous échangez directement avec le professionnel, sans intermédiaire.',
  },
]

export function LandingPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const categories = useCategories()
  const { user } = useAuth()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/trouver?q=${encodeURIComponent(q)}` : '/trouver')
  }

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center sm:py-20">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
              Gratuit et sans compte pour chercher
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              Trouvez le bon pro, <span className="text-secondary">près de chez vous</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
              Mécaniciens, plombiers, coiffeurs, professeurs particuliers… Comparez les activités
              publiées par les professionnels de votre région et contactez-les en direct, sans
              intermédiaire.
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
                  className="h-12 w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Rechercher
              </Button>
            </form>

            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Recherche 100 % gratuite
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Sans compte pour consulter
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Contact direct avec le pro
              </span>
            </div>
          </div>
        </section>

        {/* Bandeau défilant — ticker promo type marketplace */}
        <div className="overflow-hidden border-y border-border bg-secondary py-2 text-white">
          <div className="marquee-track" aria-hidden>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-10 pr-10 text-xs font-medium uppercase tracking-wide">
                <span>Recherche 100 % gratuite</span>
                <span>•</span>
                <span>Sans compte pour consulter</span>
                <span>•</span>
                <span>Contact direct avec le pro</span>
                <span>•</span>
                <span>Des dizaines de métiers réunis</span>
                <span>•</span>
                <span>Des pros près de chez vous</span>
                <span>•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories — inspiré Jumia */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="categories-title">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 id="categories-title" className="text-xl font-bold text-text-primary sm:text-2xl">
                Explorez par catégorie
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Des dizaines de métiers réunis au même endroit.
              </p>
            </div>
            <Link to="/categories" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">
              Tout voir <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/trouver?categorie=${encodeURIComponent(cat.label)}`}
                className="group flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-5 text-center transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-md)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-contrast">
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
              <p className="mt-2 text-sm text-text-secondary">De la recherche au contact, en trois étapes.</p>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-contrast">
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
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-contrast/15">
              <UserRound className="h-6 w-6 text-primary-contrast" aria-hidden />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-primary-contrast sm:text-3xl">
              Vous êtes professionnel&nbsp;?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-primary-contrast/85 sm:text-base">
              Créez votre compte professionnel, publiez vos services, découvrez les activités des
              autres pros et sollicitez-les quand vous en avez besoin.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {user?.role === 'PROFESSIONAL' ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" variant="invert">
                      Accéder à mon espace
                    </Button>
                  </Link>
                  <Link to="/trouver">
                    <Button size="lg" variant="invert-ghost">
                      Trouver &amp; solliciter un pro
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register?role=PROFESSIONAL">
                    <Button size="lg" variant="invert">
                      Créer un compte pro
                    </Button>
                  </Link>
                  <Link to="/trouver">
                    <Button size="lg" variant="invert-ghost">
                      Parcourir les pros
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <Link
              to="/tarifs"
              className="mt-5 inline-block text-sm font-medium text-primary-contrast underline-offset-4 hover:underline"
            >
              Découvrir les tarifs des professionnels →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
