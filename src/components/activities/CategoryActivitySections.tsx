import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ActivityCategoryRow } from '../../services/activities'
import { ActivityCard } from './ActivityCard'

interface CategoryActivitySectionsProps {
  rows: ActivityCategoryRow[]
  currentUserId?: string
  /** Affiche le lien « Voir plus » vers la recherche filtrée par catégorie. */
  showSeeMore?: boolean
}

/**
 * Fil d'activité présenté par catégorie : pour chaque catégorie, un titre puis
 * une rangée d'activités défilable horizontalement (de gauche à droite).
 */
export function CategoryActivitySections({
  rows,
  currentUserId,
  showSeeMore = true,
}: CategoryActivitySectionsProps) {
  return (
    <div className="space-y-8">
      {rows.map((row) => (
        <section key={row.category} aria-label={row.category}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-text-primary sm:text-lg">
              {row.category}
              <span className="ml-2 text-sm font-normal text-text-muted">
                {row.count} activité{row.count > 1 ? 's' : ''}
              </span>
            </h2>
            {showSeeMore ? (
              <Link
                to={`/trouver?categorie=${encodeURIComponent(row.category)}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Voir plus
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>

          {/* overflow-x-hidden sur le conteneur : le `-mx-4` de la rangée déborde
              volontairement pour un effet « plein bord », mais sans ce garde-fou
              il provoque un scroll horizontal parasite sur iOS. */}
          <div className="overflow-x-hidden">
            <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:gap-4 sm:px-0">
              {row.items.map((activity) => (
                <li
                  key={activity.id}
                  className="w-[72vw] max-w-[17rem] shrink-0 snap-start sm:w-72 sm:max-w-none"
                >
                  <ActivityCard
                    activity={activity}
                    currentUserId={currentUserId}
                    distance={activity.distance}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}
