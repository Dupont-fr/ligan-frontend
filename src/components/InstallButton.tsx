import { Check, Download, Share, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { installInstructions, isStandalone, promptInstall } from '../lib/pwa'
import { Button } from './ui/Button'

interface InstallButtonProps {
  /**
   * `link` : lien discret (pied de page).
   * `menu` : entrée de menu (navigation mobile).
   * `icon` : bouton icône compact (barre supérieure des espaces connectés).
   */
  variant?: 'link' | 'menu' | 'icon'
  className?: string
  label?: string
}

/**
 * Point d'entrée permanent pour installer l'application.
 *
 * La bannière flottante n'apparaît que si le navigateur expose l'invite
 * native (Chrome/Edge). Ce bouton, lui, est toujours présent : il déclenche
 * l'installation quand c'est possible et affiche sinon la marche à suivre
 * (iPhone, Firefox, computers de bureau…).
 */
export function InstallButton({ variant = 'link', className = '', label = "Installer l'application" }: InstallButtonProps) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Déjà installée (application ouverte en mode standalone) : rien à proposer.
  if (isStandalone()) return null

  const install = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
      setOpen(false)
      setDone(true)
      window.setTimeout(() => setDone(false), 4000)
      return
    }
    // Invite native indisponible : on explique comment faire manuellement.
    setOpen(true)
  }

  const instructions = installInstructions()

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={install}
          aria-label={label}
          title={label}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary ${className}`}
        >
          {done ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
        </button>
        <InstallDialog
          open={open}
          onClose={() => setOpen(false)}
          title={instructions.title}
          steps={instructions.steps}
          panelRef={panelRef}
        />
      </>
    )
  }

  if (variant === 'menu') {
    return (
      <>
        <button
          type="button"
          onClick={install}
          className={`flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary ${className}`}
        >
          {done ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          {done ? 'Application installée' : label}
        </button>
        <InstallDialog
          open={open}
          onClose={() => setOpen(false)}
          title={instructions.title}
          steps={instructions.steps}
          panelRef={panelRef}
        />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline ${className}`}
      >
        {done ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
        {done ? 'Application installée' : label}
      </button>
      <InstallDialog
        open={open}
        onClose={() => setOpen(false)}
        title={instructions.title}
        steps={instructions.steps}
        panelRef={panelRef}
      />
    </>
  )
}

interface InstallDialogProps {
  open: boolean
  onClose: () => void
  title: string
  steps: string[]
  panelRef: React.RefObject<HTMLDivElement | null>
}

function InstallDialog({ open, onClose, title, steps, panelRef }: InstallDialogProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-md)] outline-none"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-background hover:text-text-primary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <ol className="space-y-2 text-sm text-text-secondary">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] bg-background p-3 text-xs text-text-muted">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Astuce : sur iPhone, ce bouton se trouve dans l.application Partager.
        </p>

        <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}
