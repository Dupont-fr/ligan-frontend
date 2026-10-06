import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { searchBusinesses } from '../../services/activities'
import { ActivityCard } from '../activities/ActivityCard'
import { Button } from '../ui/Button'

/* Preuve de vie sur la landing : 6 dernières activités approuvées,
   liens internes vers les fiches /business/:slug (SEO).
   Section silencieusement masquée en cas d'erreur API. */
export function RecentActivities() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing-recent-activities'],
    queryFn: () => searchBusinesses({ sort: 'recent', limit: 6 }),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  if (isError) return null

  const items = data?.items ?? []

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="recent-title" aria-busy>
        <h2 id="recent-title" className="text-xl font-bold text-text-primary sm:text-2xl">
          Dernières activités publiées
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface"
              aria-hidden
            />
          ))}
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="recent-title">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-10 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
            <Plus className="h-5 w-5" aria-hidden />
          </span>
          <h2 id="recent-title" className="mt-3 text-xl font-bold text-text-primary sm:text-2xl">
            Soyez le premier à publier votre activité
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Aucune activité pour le moment dans votre région. Créez votre compte professionnel et
            présentez vos services en quelques minutes.
          </p>
          <Link to="/register?role=PROFESSIONAL" className="mt-5 inline-block">
            <Button>
              Créer un compte pro
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="recent-title">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 id="recent-title" className="text-xl font-bold text-text-primary sm:text-2xl">
            Dernières activités publiées
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Les services les plus récemment ajoutés par les professionnels de LIGAN+.
          </p>
        </div>
        <Link
          to="/trouver?sort=recent"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          Tout voir <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to="/trouver?sort=recent" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Voir toutes les activités <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
