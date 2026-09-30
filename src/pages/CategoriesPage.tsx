import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { useCategories } from '../hooks/useCategories'

export function CategoriesPage() {
  const categories = useCategories()

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <h1 className="text-2xl font-bold text-text-primary">Toutes les catégories</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Choisissez un métier pour voir les professionnels qui le proposent près de chez vous.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8">
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

          <div className="mt-8 text-center">
            <Link
              to="/trouver"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Voir toutes les activités <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
