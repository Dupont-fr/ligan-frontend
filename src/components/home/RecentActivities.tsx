import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recentByCategory } from '../../services/activities'
import { ActivityCard } from '../activities/ActivityCard'
import { Button } from '../ui/Button'

/* Preuve de vie sur la landing : 2 rangées horizontales défilables — les 5
   dernières activités des 2 catégories les plus fournies, chacune suivie
   d'un bouton « Voir plus » vers /trouver?categorie=X (SEO : liens fiches).
   Section silencieusement masquée en cas d'erreur API. */
export function RecentActivities() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing-recent-by-category'],
    queryFn: recentByCategory,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  if (isError) return null

  const rows = data?.rows ?? []

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="recent-title" aria-busy>
        <h2 id="recent-title" className="text-xl font-bold text-text-primary sm:text-2xl">
          Dernières activités publiées
        </h2>
        <div className="mt-6 space-y-8" aria-hidden>
          {[0, 1].map((r) => (
            <div key={r}>
              <div className="mb-3 h-5 w-44 animate-pulse rounded-[var(--radius-sm)] bg-surface" />
              <div className="flex gap-4">
                {[0, 1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-52 w-[78vw] max-w-xs shrink-0 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface sm:w-72" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (rows.length === 0) {
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
      <div className="mb-6">
        <h2 id="recent-title" className="text-xl font-bold text-text-primary sm:text-2xl">
          Dernières activités publiées
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Faites glisser vers la gauche pour découvrir les dernières activités de chaque catégorie.
        </p>
      </div>

      <div className="space-y-8">
        {rows.map((row) => (
          <div key={row.category} data-recent-row>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                {row.category}
                <span className="ml-2 text-sm font-normal text-text-muted">
                  {row.count} activité{row.count > 1 ? 's' : ''}
                </span>
              </h3>
            </div>

            <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:px-0">
              {row.items.map((activity) => (
                <li key={activity.id} className="w-[78vw] max-w-xs shrink-0 snap-start sm:w-72">
                  <ActivityCard activity={activity} />
                </li>
              ))}
            </ul>

            <Link
              to={`/trouver?categorie=${encodeURIComponent(row.category)}`}
              className="mt-3 inline-flex"
            >
              <Button variant="outline" size="sm">
                Voir plus
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
