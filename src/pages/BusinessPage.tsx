import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  Building2,
  Clock,
  ImagePlus,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SolicitForm } from '../components/activities/SolicitForm'
import { ReviewsSection } from '../components/activities/ReviewsSection'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { buttonClass } from '../components/ui/buttonClass'
import { Card } from '../components/ui/Card'
import { StarRating } from '../components/ui/StarRating'
import { useAuth } from '../features/auth/AuthContext'
import { useJsonLd, usePageMeta } from '../lib/usePageMeta'
import { getBusiness } from '../services/activities'
import { trackEvent, visitorSessionId } from '../services/analytics'

const DAY_LABELS: Record<string, string> = {
  MON: 'Lundi',
  TUE: 'Mardi',
  WED: 'Mercredi',
  THU: 'Jeudi',
  FRI: 'Vendredi',
  SAT: 'Samedi',
  SUN: 'Dimanche',
}
const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
const WEEKDAY_BY_GETDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

function telHref(phone: string): string {
  const cleaned = phone.replace(/[\s().-]/g, '')
  return `tel:${cleaned.startsWith('+') ? cleaned : `+237${cleaned.replace(/\D/g, '')}`}`
}

function waHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits.startsWith('237') ? digits : `237${digits}`}`
}

interface HourSlot {
  day: string
  open: string
  close: string
  closed: boolean
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Vrai si l'établissement est ouvert à l'instant (plages passant minuit gérées). */
function isOpenNow(hours: HourSlot[]): boolean {
  const now = new Date()
  const today = WEEKDAY_BY_GETDAY[now.getDay()]
  const slot = hours.find((h) => h.day === today)
  if (!slot || slot.closed) return false
  const minutes = now.getHours() * 60 + now.getMinutes()
  const open = toMinutes(slot.open)
  const close = toMinutes(slot.close)
  if (close <= open) return minutes >= open || minutes < close
  return minutes >= open && minutes < close
}

/** Badge « Ouvert / Fermé » calculé sur les horaires d'aujourd'hui. */
function StatusBadge({ hours }: { hours: HourSlot[] }) {
  if (hours.length === 0) return null
  const open = isOpenNow(hours)
  return (
    <Badge variant={open ? 'success' : 'error'}>
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${open ? 'bg-white' : 'bg-white/80'}`}
      />
      {open ? 'Ouvert' : 'Fermé'}
    </Badge>
  )
}

/** Galerie photos — remontée à 0 au changement de fiche via `key={slug}`. */
function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center text-text-muted">
        <ImagePlus className="h-8 w-8" aria-hidden />
        <p className="mt-2 text-sm">Aucune photo pour cette activité</p>
      </div>
    )
  }

  return (
    <>
      <img
        src={photos[index] ?? photos[0]}
        alt={title}
        className="aspect-[16/10] w-full bg-background object-cover"
      />
      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-border p-2">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir la photo ${i + 1}`}
              className="shrink-0"
            >
              <img
                src={url}
                alt=""
                className={`h-14 w-20 rounded-[var(--radius-sm)] object-cover transition-all ${
                  i === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </>
  )
}

export function BusinessPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => getBusiness(slug as string),
    enabled: Boolean(slug),
    retry: false,
  })

  const activity = data?.activity
  const professional = data?.professional
  const rating = data?.rating ?? { average: 0, count: 0 }
  const reviews = data?.reviews ?? []

  // SEO : titre + description dynamiques, balise structurée ProfessionalService.
  usePageMeta(
    activity ? `${activity.title} — LIGAN+` : 'Fiche professionnelle — LIGAN+',
    activity ? activity.description.slice(0, 160) : undefined,
  )
  const jsonLd = useMemo(() => {
    if (!activity) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: activity.title,
      description: activity.description.slice(0, 300),
      url: `https://ligan.plus/business/${slug}`,
      ...(activity.contacts.phone ? { telephone: activity.contacts.phone } : {}),
      ...(activity.address.city
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: activity.address.city,
              addressCountry: 'CM',
            },
          }
        : {}),
      ...(rating.count > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: rating.average,
              reviewCount: rating.count,
            },
          }
        : {}),
    }
  }, [activity, slug, rating.average, rating.count])
  useJsonLd(jsonLd)
  const todayKey = WEEKDAY_BY_GETDAY[new Date().getDay()]
  const activityId = activity?.id
  const queryClient = useQueryClient()
  const onReviewsChanged = () => {
    void queryClient.invalidateQueries({ queryKey: ['business', slug] })
  }

  // Vue du profil : une fois par activité et par jour (Sprint 10)
  useEffect(() => {
    if (!activityId) return
    const today = new Date().toISOString().slice(0, 10)
    const key = `ligan-pv-${activityId}-${today}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* stockage indisponible : on envoie quand même */
    }
    trackEvent({ activityId, type: 'PROFILE_VIEW', sessionId: visitorSessionId() }).catch(() => {})
  }, [activityId])

  const trackClick = (type: 'PHONE_CLICK' | 'WHATSAPP_CLICK' | 'DIRECTION_CLICK') => {
    if (!activityId) return
    trackEvent({ activityId, type, sessionId: visitorSessionId() }).catch(() => {})
  }

  const content = (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted" aria-label="Fil d'Ariane">
        <Link to="/" className="transition-colors hover:text-primary">
          Accueil
        </Link>
        <span aria-hidden>/</span>
        <Link to="/trouver" className="transition-colors hover:text-primary">
          Trouver un pro
        </Link>
        {activity ? (
          <>
            <span aria-hidden>/</span>
            <span className="text-text-secondary">{activity.category}</span>
          </>
        ) : null}
      </nav>

      {isLoading ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="aspect-[16/10] animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-border-light" />
            <div className="h-40 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
          </div>
          <div className="h-72 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
        </div>
      ) : isError || !activity || !professional ? (
        <Card className="mt-6 p-10 text-center">
          <p className="text-base font-semibold text-text-primary">Fiche introuvable</p>
          <p className="mt-1 text-sm text-text-secondary">
            Cette activité n’existe plus ou n’a jamais été publiée.
          </p>
          <Link to="/trouver" className={`${buttonClass('primary', 'md')} mt-4`}>
            Retour à la recherche
          </Link>
        </Card>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Galerie */}
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
              <PhotoGallery key={slug} photos={activity.photos} title={activity.title} />
            </div>

            {/* En-tête */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{activity.category}</Badge>
                    {activity.address.city ? (
                      <Badge>
                        <MapPin className="inline h-3 w-3" aria-hidden /> {activity.address.city}
                      </Badge>
                    ) : null}
                    <StatusBadge hours={activity.openingHours} />
                  </div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
                    {activity.title}
                  </h1>
                  {rating.count > 0 ? (
                    <a
                      href="#avis"
                      className="mt-2 inline-flex max-w-full flex-wrap items-center gap-2 transition-opacity hover:opacity-80"
                    >
                      <StarRating value={rating.average} size="sm" />
                      <span className="text-sm font-bold tabular-nums text-text-primary">
                        {rating.average}
                      </span>
                      <span className="text-xs text-text-muted">
                        {rating.count} avis
                      </span>
                    </a>
                  ) : null}
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-4 w-4 text-text-muted" aria-hidden />
                      {professional.firstName} {professional.lastName}
                    </span>
                    {professional.isVerified ? (
                      <Badge variant="success">
                        <BadgeCheck className="inline h-3 w-3" aria-hidden /> Vérifié
                      </Badge>
                    ) : null}
                    {professional.planCode === 'PREMIUM' ? <Badge variant="promo">Premium</Badge> : null}
                    {professional.memberSince ? (
                      <span className="text-text-muted">
                        Membre depuis{' '}
                        {new Date(professional.memberSince).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    ) : null}
                  </p>
                </div>
                {activity.price ? (
                  <span className="max-w-full shrink-0 truncate rounded-[var(--radius-sm)] bg-secondary-light px-3 py-1.5 text-base font-bold text-secondary">
                    {activity.price}
                  </span>
                ) : (
                  <Badge>Tarif sur demande</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <Card className="p-5">
              <h2 className="text-base font-semibold text-text-primary">À propos</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {activity.description}
              </p>
              {activity.location ? (
                <p className="mt-3 text-sm text-text-muted">Zone d’intervention : {activity.location}</p>
              ) : null}
            </Card>

            {/* Services */}
            {activity.services.length > 0 ? (
              <Card className="p-5">
                <h2 className="text-base font-semibold text-text-primary">Prestations</h2>
                <ul className="mt-3 divide-y divide-border">
                  {activity.services.map((service) => (
                    <li key={service.name} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-sm text-text-primary">{service.name}</span>
                      {service.price ? (
                        <span className="shrink-0 text-sm font-semibold text-text-primary">{service.price}</span>
                      ) : (
                        <span className="shrink-0 text-xs text-text-muted">Sur demande</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {/* Horaires */}
            {activity.openingHours.length > 0 ? (
              <Card className="p-5">
                <h2 className="flex items-center justify-between gap-2 text-base font-semibold text-text-primary">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" aria-hidden />
                    Horaires d’ouverture
                  </span>
                  <StatusBadge hours={activity.openingHours} />
                </h2>
                <div className="mt-3 divide-y divide-border overflow-hidden rounded-[var(--radius-sm)] border border-border">
                  {DAY_ORDER.map((day) => {
                    const hour = activity.openingHours.find((h) => h.day === day)
                    if (!hour) return null
                    const isToday = day === todayKey
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between px-3 py-2 text-sm ${
                          isToday ? 'bg-primary-light/60 font-medium' : ''
                        }`}
                      >
                        <span className="text-text-primary">
                          {DAY_LABELS[day]}
                          {isToday ? (
                            <span className="ml-2 text-xs font-normal text-primary">aujourd’hui</span>
                          ) : null}
                        </span>
                        {hour.closed ? (
                          <span className="text-text-muted">Fermé</span>
                        ) : (
                          <span className="tabular-nums text-text-secondary">
                            {hour.open} – {hour.close}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            ) : null}

            {/* Localisation */}
            {activity.address.city || activity.address.district || activity.address.street ? (
              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                  <MapPin className="h-4 w-4 text-text-muted" aria-hidden />
                  Localisation
                </h2>
                <p className="mt-3 text-sm text-text-secondary">
                  {[activity.address.street, activity.address.district, activity.address.city]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [activity.address.street, activity.address.district, activity.address.city]
                      .filter(Boolean)
                      .join(' '),
                  )}`}
                  onClick={() => trackClick('DIRECTION_CLICK')}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  Voir sur Google Maps
                </a>
              </Card>
            ) : null}

            {/* Avis (Sprint 11) */}
            <div id="avis">
              <ReviewsSection
                activityId={activity.id}
                rating={rating}
                reviews={reviews}
                isOwner={Boolean(professional && user?.id === professional.id)}
                onChanged={onReviewsChanged}
              />
            </div>
          </div>

          {/* Colonne contact */}
          <aside className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Contact</p>
                <StatusBadge hours={activity.openingHours} />
              </div>
              {(() => {
                const todayHour = activity.openingHours.find((h) => h.day === todayKey)
                if (!todayHour) return null
                return (
                  <p className="mt-1 text-xs text-text-muted">
                    Aujourd’hui :{' '}
                    {todayHour.closed ? (
                      <span className="font-medium text-text-secondary">fermé</span>
                    ) : (
                      <span className="font-medium tabular-nums text-text-secondary">
                        {todayHour.open} – {todayHour.close}
                      </span>
                    )}
                  </p>
                )
              })()}

              <div className="mt-3 space-y-2">
                {activity.contacts.phone ? (
                  <a
                    href={telHref(activity.contacts.phone)}
                    onClick={() => trackClick('PHONE_CLICK')}
                    className={`${buttonClass('primary', 'md')} w-full`}
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Appeler
                  </a>
                ) : null}
                {activity.contacts.whatsapp ? (
                  <a
                    href={waHref(activity.contacts.whatsapp)}
                    onClick={() => trackClick('WHATSAPP_CLICK')}
                    target="_blank"
                    rel="noreferrer"
                    className={`${buttonClass('secondary', 'md')} w-full`}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    WhatsApp
                  </a>
                ) : null}
                {activity.contacts.email ? (
                  <a
                    href={`mailto:${activity.contacts.email}`}
                    className={`${buttonClass('outline', 'md')} w-full`}
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Écrire par email
                  </a>
                ) : null}
                {!activity.contacts.phone && !activity.contacts.whatsapp && !activity.contacts.email ? (
                  <p className="text-sm text-text-muted">Aucun contact direct publié.</p>
                ) : null}
              </div>

              <div className="my-4 border-t border-border" />

              {user?.id === professional.id ? (
                <Link to="/dashboard" className={`${buttonClass('outline', 'md')} w-full`}>
                  Gérer cette activité
                </Link>
              ) : (
                <SolicitForm variant="full" activityId={activity.id} toProfessionalId={professional.id} />
              )}
              <p className="mt-2 text-xs text-text-muted">
                Gratuit et sans engagement — le pro vous répond depuis son espace.
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Professionnel</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-light text-primary">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {professional.firstName} {professional.lastName}
                  </p>
                  <p className="text-xs text-text-muted">{activity.category}</p>
                </div>
              </div>
              {activity.address.city ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4 text-text-muted" aria-hidden />
                  {activity.address.city}
                  {activity.address.district ? ` — ${activity.address.district}` : ''}
                </p>
              ) : null}
            </Card>

            {!user ? (
              <Alert variant="info">
                <Link to="/register" className="font-medium underline">
                  Créez un compte
                </Link>{' '}
                pour envoyer une demande directement au professionnel.
              </Alert>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  )

  return (
    <div className="has-bottom-nav flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">{content}</main>
      <SiteFooter />
    </div>
  )
}
