import { Download, Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/Button'
import {
  canPromptInstall,
  dismissInstall,
  isDismissed,
  isIos,
  isStandalone,
  onInstallState,
  promptInstall,
} from '../lib/pwa'

/**
 * Bannière « Installer LIGAN+ ».
 *
 * Deux cas :
 * - Android / Chrome / Edge : l'invite native du navigateur est capturée et
 *   déclenchée au clic sur « Installer » ;
 * - iOS (Safari et autres navigateurs iOS) : l'invite n'existe pas, on
 *   affiche la marche à suivre (Partager → Sur l'écran d'accueil).
 *
 * La bannière n'apparaît qu'une fois le service worker actif (c'est la
 * condition posée par le navigateur pour proposer l'installation) : comptez
 * une dizaine de secondes après la toute première visite, ou rechargez la page.
 *
 * Le composant est purement visuel : aucun impact sur la navigation ni sur
 * les données de l'application.
 */
export function InstallPrompt() {
  const [available, setAvailable] = useState(() => canPromptInstall())
  const [dismissed, setDismissed] = useState(() => isDismissed())
  const [installed, setInstalled] = useState(() => isStandalone())

  useEffect(() => {
    return onInstallState(() => {
      setAvailable(canPromptInstall())
      if (isStandalone()) setInstalled(true)
    })
  }, [])

  const close = () => {
    setDismissed(true)
    dismissInstall()
  }

  if (installed || dismissed) return null

  const showIosHint = !available && isIos()
  if (!available && !showIosHint) return null

  const install = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
      setInstalled(true)
      // On mémorise aussi le refus : la bannière ne reviendra pas de sitôt,
      // mais le bouton « Installer l'application » du pied de page reste
      // disponible si l'utilisateur change d'avis.
      close()
      return
    }
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
          src="/logo-mark.png"
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

      {available ? (
        <Button size="sm" className="mt-3 w-full" onClick={install}>
          <Download className="h-4 w-4" aria-hidden />
          Installer l’application
        </Button>
      ) : null}
    </div>
  )
}
