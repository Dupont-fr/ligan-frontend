import { Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ActivityCard } from '../components/activities/ActivityCard'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Button } from '../components/ui/Button'
import { CATEGORIES } from '../lib/categories'
import { listActivities } from '../services/activities'

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const initialCategory = searchParams.get('categorie') ?? ''

  const [query, setQuery] = useState(initialQ)
  const [category, setCategory] = useState(initialCategory)

  const { data, isLoading } = useQuery({
    queryKey: ['activities', initialQ, initialCategory],
    queryFn: () => listActivities({ q: initialQ || undefined, category: initialCategory || undefined }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('categorie', category)
    setSearchParams(params)
  }

  const toggleCategory = (label: string) => {
    const next = category === label ? '' : label
    setCategory(next)
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (next) params.set('categorie', next)
    setSearchParams(params)
  }

  const activities = data?.activities ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <h1 className="text-2xl font-bold text-text-primary">Trouver un professionnel</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Consultez librement les activités publiées — aucun compte nécessaire.
            </p>

            <form onSubmit={handleSearch} className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
                <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Métier, service, mot-clé…"
                  aria-label="Rechercher"
                  className="h-11 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Rechercher
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className={`inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat.label
                      ? 'border-primary bg-primary text-primary-contrast'
                      : 'border-border bg-surface text-text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5" aria-hidden />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-10 text-center">
              <p className="font-medium text-text-primary">Aucune activité trouvée</p>
              <p className="mt-1 text-sm text-text-secondary">
                Essayez une autre recherche ou revenez un peu plus tard — les pros publient chaque jour.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-text-secondary">
                {activities.length} activité{activities.length > 1 ? 's' : ''} trouvée
                {activities.length > 1 ? 's' : ''}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
