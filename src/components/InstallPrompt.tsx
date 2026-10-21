import { Download, Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/Button'
import {
  dismissInstall,
  isDismissed,
  isIosSafari,
  isStandalone,
  type BeforeInstallPromptEvent,
} from '../lib/pwa'

/**
 * Bannière « Installer LIGAN+ ».
 *
 * Deux cas :
 * - Android / Chrome / Edge : l'invite native du navigateur est capturée et
 *   déclenchée au clic sur « Installer » ;
 * - iOS Safari : l'invite n'existe pas, on affiche la marche à suivre
 *   (Partager → Sur l'écran d'accueil).
 *
 * Le composant est purement visuel : aucun impact sur la navigation ni sur
 * les données de l'application.
 */
export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => isDismissed())
  const [installed, setInstalled] = useState(() => isStandalone())

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Empêche l'invite native (mini-bannière) : on affiche la nôtre.
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const close = () => {
    setDismissed(true)
    dismissInstall()
  }

  if (installed || dismissed) return null

  const showIosHint = !promptEvent && isIosSafari()
  if (!promptEvent && !showIosHint) return null

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
    close()
  }

  return (
    <div
      role="region"
      aria-label="Installer l'application LIGAN+"
      className="pointer-events-auto fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[var(--radius-lg)] border border-border bg-surface p-3 shadow-[var(--shadow-md)] lg:bottom-6"
    >
      <div className="flex items-start gap-3">
        <img
          src="/icons/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-[var(--radius-md)]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">Installer LIGAN+</p>
          <p className="text-xs text-text-secondary">
            {showIosHint ? (
              <>
                Sur iPhone : touchez <Share className="inline h-3 w-3" aria-hidden /> Partager puis « Sur
                l’écran d’accueil ».
              </>
            ) : (
              'Accédez à vos professionnels favoris plus vite, même hors connexion.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer l’invite d’installation"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-background hover:text-text-primary"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {promptEvent ? (
        <Button size="sm" className="mt-3 w-full" onClick={install}>
          <Download className="h-4 w-4" aria-hidden />
          Installer l’application
        </Button>
      ) : null}
    </div>
  )
}
