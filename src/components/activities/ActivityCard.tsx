import { MapPin, Send, Tag, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import type { Activity } from '../../services/activities'
import { createSolicitation } from '../../services/solicitations'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface ActivityCardProps {
  activity: Activity
  currentUserId?: string
}

export function ActivityCard({ activity, currentUserId }: ActivityCardProps) {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sending, setSending] = useState(false)

  const pro = activity.professional
  const proName = pro && (pro.firstName || pro.lastName) ? `${pro.firstName} ${pro.lastName}`.trim() : 'Professionnel'
  const proId = pro?.id
  const isMine = Boolean(currentUserId && proId === currentUserId)

  const handleSolicit = async () => {
    setFeedback(null)
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: '/trouver' } })
      return
    }
    if (!proId) return
    setSending(true)
    try {
      await createSolicitation({ toProfessionalId: proId, activityId: activity.id, message })
      setFeedback({ type: 'success', text: 'Sollicitation envoyée ! Le professionnel y répondra dans son espace.' })
      setMessage('')
      setShowForm(false)
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof ApiError ? err.message : "Une erreur est survenue lors de l'envoi",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col rounded-[var(--radius-md)] border border-border bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="secondary">{activity.category}</Badge>
          <h3 className="mt-2 truncate text-base font-semibold text-text-primary">{activity.title}</h3>
        </div>
        {activity.price ? (
          <span className="shrink-0 text-sm font-bold text-primary">{activity.price}</span>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{activity.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5" aria-hidden />
          {proName}
        </span>
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

      {feedback ? <Alert variant={feedback.type === 'success' ? 'success' : 'error'} className="mt-3">{feedback.text}</Alert> : null}

      {isMine ? (
        <p className="mt-4 text-xs font-medium text-text-muted">Votre activité</p>
      ) : showForm ? (
        <div className="mt-4 space-y-2">
          <label htmlFor={`solicit-${activity.id}`} className="text-sm font-medium text-text-primary">
            Votre message
          </label>
          <textarea
            id={`solicit-${activity.id}`}
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bonjour, je souhaite solliciter vos services…"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSolicit} loading={sending} disabled={message.trim().length < 10}>
              <Send className="h-4 w-4" aria-hidden />
              Envoyer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
          </div>
          {message.trim().length > 0 && message.trim().length < 10 ? (
            <p className="text-xs text-text-muted">10 caractères minimum.</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            Solliciter ce pro
          </Button>
        </div>
      )}
    </div>
  )
}
