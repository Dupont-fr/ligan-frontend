import { ArrowLeft, Compass, LifeBuoy, Mail, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { buttonClass } from '../components/ui/buttonClass'
import { Card } from '../components/ui/Card'
import { usePageMeta } from '../lib/usePageMeta'

const suggestions = [
  {
    icon: Search,
    title: 'Trouver un professionnel',
    text: 'Cherchez par métier ou par mot-clé près de chez vous.',
    to: '/trouver',
  },
  {
    icon: Compass,
    title: 'Explorer les catégories',
    text: 'Parcourez tous les services proposés sur LIGAN+.',
    to: '/categories',
  },
  {
    icon: LifeBuoy,
    title: 'Centre d’aide',
    text: 'Les réponses aux questions les plus fréquentes.',
    to: '/aide',
  },
]

export function NotFoundPage() {
  const { pathname } = useLocation()

  usePageMeta(
    'Page introuvable — LIGAN+',
    'Cette page LIGAN+ n’existe pas ou a été déplacée. Retrouvez les professionnels près de chez vous.',
  )

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary-light to-background">
          <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary">
              <Compass className="h-3.5 w-3.5" aria-hidden />
              Page introuvable
            </span>

            <p className="mt-5 text-7xl font-extrabold leading-none tracking-tight text-primary sm:text-8xl" aria-hidden>
              404
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Cette page a disparu du <span className="text-secondary">radar</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
              L’adresse que vous avez suivie n’existe pas ou a été déplacée. Pas de panique : le
              reste de LIGAN+ est toujours là.
            </p>

            {pathname !== '/' ? (
              <p className="mt-5 break-all text-xs text-text-muted">
                Adresse demandée :{' '}
                <code className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1 text-text-secondary">
                  {pathname}
                </code>
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/" className={buttonClass('primary', 'md')}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Retour à l’accueil
              </Link>
              <Link to="/contact" className={buttonClass('outline', 'md')}>
                <Mail className="h-4 w-4" aria-hidden />
                Nous signaler
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <h2 className="text-center text-lg font-semibold text-text-primary">
            À la place, vous pouvez…
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {suggestions.map((item) => (
              <Link key={item.title} to={item.to}>
                <Card className="h-full p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-md)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="mt-2.5 text-sm font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{item.text}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
