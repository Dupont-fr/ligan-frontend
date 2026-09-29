import { Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import { createSolicitation } from '../../services/solicitations'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

interface SolicitFormProps {
  activityId: string
  toProfessionalId: string
  variant?: 'card' | 'full'
  onSent?: () => void
}

/** Formulaire « envoyer une demande » au professionnel (partagé carte + fiche publique). */
export function SolicitForm({ activityId, toProfessionalId, variant = 'card', onSent }: SolicitFormProps) {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sending, setSending] = useState(false)

  const full = variant === 'full'

  const submit = async () => {
    setFeedback(null)
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: '/trouver' } })
      return
    }
    setSending(true)
    try {
      await createSolicitation({ toProfessionalId, activityId, message })
      setFeedback({ type: 'success', text: 'Demande envoyée. Le professionnel vous répondra depuis son espace.' })
      setMessage('')
      setOpen(false)
      onSent?.()
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
    <div className={full ? 'space-y-3' : ''}>
      {feedback ? <Alert variant={feedback.type}>{feedback.text}</Alert> : null}

      {open ? (
        <div className="space-y-2">
          <label htmlFor={`solicit-${activityId}`} className="text-sm font-medium text-text-primary">
            Votre message
          </label>
          <textarea
            id={`solicit-${activityId}`}
            rows={full ? 4 : 3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bonjour, je suis intéressé(e) par vos services…"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} loading={sending} disabled={message.trim().length < 10}>
              <Send className="h-4 w-4" aria-hidden />
              Envoyer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setFeedback(null) }}>
              Annuler
            </Button>
          </div>
          {message.trim().length > 0 && message.trim().length < 10 ? (
            <p className="text-xs text-text-muted">10 caractères minimum.</p>
          ) : null}
        </div>
      ) : (
        <Button variant={full ? undefined : 'outline'} size="sm" className={full ? 'w-full' : ''} onClick={() => setOpen(true)}>
          {full ? 'Envoyer une demande' : 'Solliciter ce pro'}
        </Button>
      )}
    </div>
  )
}
