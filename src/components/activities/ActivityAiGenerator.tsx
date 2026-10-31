import { Sparkles, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { generateActivityDraft } from '../../services/ai'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

interface ActivityAiGeneratorProps {
  open: boolean
  onClose: () => void
  onGenerated: (draft: { titre: string; description: string; services?: string[] }) => void
}

const inputClass =
  'w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary'

export function ActivityAiGenerator({ open, onClose, onGenerated }: ActivityAiGeneratorProps) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const generate = async () => {
    if (!prompt.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await generateActivityDraft(prompt.trim())
      const draft = (res as any).draft ?? res
      onGenerated({
        titre: draft.titre,
        description: draft.description,
        services: Array.isArray(draft.services) ? draft.services : [],
      })
      setPrompt('')
      onClose()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Impossible de générer l'activité avec l'IA"
      if (msg.toLowerCase().includes('pro') || msg.toLowerCase().includes('premium')) {
        setError("Accès réservé aux abonnements Pro/Premium. Redirection vers les tarifs...")
        setTimeout(() => navigate('/dashboard?section=subscription'), 1500)
        return
      }
      if (msg.toLowerCase().includes('2 créations') || msg.toLowerCase().includes('gratuite')) {
        setError(msg + " Redirection vers les tarifs...")
        setTimeout(() => navigate('/dashboard?section=subscription'), 1500)
        return
      }
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-3 py-2 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Générateur IA d'activité"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div>
              <h2 className="text-base font-semibold tracking-tight text-text-primary">Générer mon activité avec l'IA</h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Décrivez votre activité. L'IA créera un titre, une description et des services optimisés.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">
          {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
          <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="ai-prompt">
            Décrivez votre activité *
          </label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Ex. Plomberie à domicile à Douala : réparation de fuites, débouchage, installation sanitaire"
            className={`${inputClass} h-auto py-2.5`}
          />
          <p className="mt-1 text-right text-xs text-text-muted">{prompt.length}/500</p>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-background/95 px-4 py-3 sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-background/50 sm:px-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button size="sm" onClick={generate} loading={busy} disabled={busy || prompt.trim().length < 10} className="w-full sm:w-auto">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Générer et remplir le formulaire
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
