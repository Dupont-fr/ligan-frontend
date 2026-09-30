import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Camera, Clock, LocateFixed, RotateCcw, Search, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActivityCard } from '../components/activities/ActivityCard'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Button } from '../components/ui/Button'
import { useCategories } from '../hooks/useCategories'
import { searchBusinesses, type BusinessSort } from '../services/activities'

const RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50]
const RESULTS_LIMIT = 50

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('categorie') ?? ''
  const city = searchParams.get('ville') ?? ''
  const openNow = searchParams.get('ouvert') === '1'
  const withPhotos = searchParams.get('photos') === '1'
  const verifiedOnly = searchParams.get('verifie') === '1'
  const rawLat = searchParams.get('lat')
  const rawLng = searchParams.get('lng')
  const lat = rawLat !== null && Number.isFinite(Number(rawLat)) ? Number(rawLat) : null
  const lng = rawLng !== null && Number.isFinite(Number(rawLng)) ? Number(rawLng) : null
  const nearMe = lat !== null && lng !== null
  const radiusKm = RADIUS_OPTIONS_KM.includes(Number(searchParams.get('rayon')))
    ? Number(searchParams.get('rayon'))
    : 10
  const sortParam = searchParams.get('tri')
  const sort: BusinessSort =
    sortParam === 'name' || sortParam === 'distance' ? sortParam : 'recent'
  const effectiveSort: BusinessSort = sort === 'distance' && !nearMe ? 'recent' : sort

  const [query, setQuery] = useState(q)
  const [cityInput, setCityInput] = useState(city)
  const [geoBusy, setGeoBusy] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const cityTimer = useRef<number | undefined>(undefined)
  const categories = useCategories()

  const hasFilters =
    Boolean(city || openNow || withPhotos || verifiedOnly || nearMe) || effectiveSort !== 'recent'

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    update({ q: query.trim() || null })
  }

  const toggleCategory = (label: string) => {
    update({ categorie: category === label ? null : label })
  }

  const onCityChange = (value: string) => {
    setCityInput(value)
    window.clearTimeout(cityTimer.current)
    cityTimer.current = window.setTimeout(() => {
      update({ ville: value.trim() || null })
    }, 400)
  }

  const toggleNearMe = () => {
    if (nearMe) {
      update({ lat: null, lng: null, rayon: null, tri: sort === 'distance' ? 'recent' : sort })
      return
    }
    if (!('geolocation' in navigator)) {
      setGeoError('La géolocalisation n’est pas disponible sur cet appareil.')
      return
    }
    setGeoBusy(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          rayon: String(radiusKm),
        })
        setGeoBusy(false)
      },
      () => {
        setGeoError('Position introuvable — autorisez l’accès à votre position puis réessayez.')
        setGeoBusy(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const resetFilters = () => {
    setQuery('')
    setCityInput('')
    setSearchParams(new URLSearchParams())
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', q, category, city, openNow, withPhotos, verifiedOnly, effectiveSort, lat, lng, radiusKm],
    queryFn: () =>
      searchBusinesses({
        q: q || undefined,
        category: category || undefined,
        city: city || undefined,
        openNow: openNow || undefined,
        hasPhotos: withPhotos || undefined,
        verified: verifiedOnly || undefined,
        sort: effectiveSort,
        latitude: lat ?? undefined,
        longitude: lng ?? undefined,
        radius: nearMe ? radiusKm * 1000 : undefined,
        limit: RESULTS_LIMIT,
      }),
    placeholderData: (prev) => prev,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? 'border-primary bg-primary text-primary-contrast'
        : 'border-border bg-surface text-text-secondary hover:border-primary hover:text-primary'
    }`

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <h1 className="text-2xl font-bold text-text-primary">Trouver un professionnel</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Recherchez par métier, ville ou mot-clé : la consultation est libre et sans compte.
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
                  className="h-11 w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Rechercher
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className={chipClass(category === cat.label)}
                >
                  <cat.icon className="h-3.5 w-3.5" aria-hidden />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={cityInput}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="Ville…"
                aria-label="Filtrer par ville"
                className="h-9 w-40 rounded-[var(--radius-full)] border border-border bg-surface px-3 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              />
              <button
                type="button"
                onClick={() => update({ ouvert: openNow ? null : '1' })}
                className={chipClass(openNow)}
                aria-pressed={openNow}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Ouvert maintenant
              </button>
              <button
                type="button"
                onClick={() => update({ photos: withPhotos ? null : '1' })}
                className={chipClass(withPhotos)}
                aria-pressed={withPhotos}
              >
                <Camera className="h-3.5 w-3.5" aria-hidden />
                Avec photos
              </button>
              <button
                type="button"
                onClick={() => update({ verifie: verifiedOnly ? null : '1' })}
                className={chipClass(verifiedOnly)}
                aria-pressed={verifiedOnly}
              >
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Pro vérifié
              </button>
              <button
                type="button"
                onClick={toggleNearMe}
                disabled={geoBusy}
                className={chipClass(nearMe)}
                aria-pressed={nearMe}
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden />
                {geoBusy ? 'Localisation…' : nearMe ? 'Près de moi ✓' : 'Près de moi'}
              </button>
              {nearMe ? (
                <select
                  value={radiusKm}
                  onChange={(e) => update({ rayon: e.target.value })}
                  aria-label="Rayon de recherche"
                  className="h-9 rounded-[var(--radius-full)] border border-border bg-surface px-3 text-xs text-text-primary outline-none focus:border-primary"
                >
                  {RADIUS_OPTIONS_KM.map((km) => (
                    <option key={km} value={km}>
                      rayon {km} km
                    </option>
                  ))}
                </select>
              ) : null}
              {geoError ? (
                <span className="inline-flex items-center gap-1 text-xs text-secondary">
                  <X className="h-3.5 w-3.5" aria-hidden />
                  {geoError}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-secondary" role="status">
              {isLoading ? (
                'Recherche en cours…'
              ) : isError ? (
                'La recherche a échoué — réessayez.'
              ) : (
                <>
                  <span className="font-semibold text-text-primary">{total}</span>{' '}
                  résultat{total > 1 ? 's' : ''}
                  {data?.geo ? ' · triés par distance' : ''}
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              {hasFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Réinitialiser
                </button>
              ) : null}
              <label className="inline-flex items-center gap-2 text-xs text-text-muted">
                Trier par
                <select
                  value={effectiveSort}
                  onChange={(e) => update({ tri: e.target.value === 'recent' ? null : e.target.value })}
                  className="h-9 rounded-[var(--radius-sm)] border border-border bg-surface px-2 text-xs text-text-primary outline-none focus:border-primary"
                >
                  <option value="recent">Plus récents</option>
                  {nearMe ? <option value="distance">Plus proches</option> : null}
                  <option value="name">Nom A → Z</option>
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-10 text-center">
              <p className="font-medium text-text-primary">Aucune activité trouvée</p>
              <p className="mt-1 text-sm text-text-secondary">
                Élargissez le rayon, retirez un filtre ou essayez une autre recherche.
              </p>
              {hasFilters ? (
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} distance={activity.distance} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
