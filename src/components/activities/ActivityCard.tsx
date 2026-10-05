import { BadgeCheck, MapPin, Navigation, Tag, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Activity } from '../../services/activities'
import { Badge } from '../ui/Badge'
import { SolicitForm } from './SolicitForm'

interface ActivityCardProps {
  activity: Activity
  currentUserId?: string
  distance?: number
}

export function ActivityCard({ activity, currentUserId, distance }: ActivityCardProps) {
  const pro = activity.professional
  const proName = pro && (pro.firstName || pro.lastName) ? `${pro.firstName} ${pro.lastName}`.trim() : 'Professionnel'
  const proId = pro?.id
  const isMine = Boolean(currentUserId && proId === currentUserId)

  return (
    <div
      className={`flex flex-col rounded-[var(--radius-md)] border border-border bg-surface p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]${
        activity.planCode === 'PREMIUM' ? ' ring-1 ring-primary/30' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{activity.category}</Badge>
            {activity.planCode === 'PREMIUM' ? <Badge variant="promo">Premium</Badge> : null}
            {activity.isVerified ? (
              <Badge variant="success">
                <BadgeCheck className="inline h-3 w-3" aria-hidden /> Vérifié
              </Badge>
            ) : null}
            {activity.status && activity.status !== 'APPROVED' ? (
              <Badge variant={activity.status === 'PENDING' ? 'warning' : activity.status === 'REJECTED' ? 'error' : 'neutral'}>
                {activity.status === 'PENDING'
                  ? 'En attente de validation'
                  : activity.status === 'REJECTED'
                    ? 'Refusée'
                    : 'Suspendue'}
              </Badge>
            ) : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold text-text-primary">
            {activity.slug ? (
              <Link
                to={`/business/${activity.slug}`}
                className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {activity.title}
              </Link>
            ) : (
              activity.title
            )}
          </h3>
        </div>
        {activity.price ? (
          <span className="max-w-full shrink-0 truncate rounded-[var(--radius-sm)] bg-secondary-light px-2 py-0.5 text-right text-sm font-bold text-secondary">
            {activity.price}
          </span>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{activity.description}</p>

      {activity.moderationReason && activity.status && activity.status !== 'APPROVED' ? (
        <p className="mt-2 text-xs text-error">Motif de la modération : {activity.moderationReason}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5" aria-hidden />
          {proName}
        </span>
        {typeof distance === 'number' ? (
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            {distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`}
          </span>
        ) : null}
        {activity.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {activity.location}
          </span>
        ) : null}
        {!activity.price ? (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" aria-hidden />
            Tarif sur demande
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {activity.slug ? (
          <Link
            to={`/business/${activity.slug}`}
            className="text-xs font-medium text-text-muted transition-colors hover:text-primary"
          >
            Voir la fiche →
          </Link>
        ) : (
          <span />
        )}

        {isMine ? (
          <p className="text-xs font-medium text-text-muted">Votre activité</p>
        ) : proId ? (
          <SolicitForm activityId={activity.id} toProfessionalId={proId} />
        ) : null}
      </div>
    </div>
  )
}
