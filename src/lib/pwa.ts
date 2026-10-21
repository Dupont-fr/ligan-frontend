/**
 * Helpers PWA (Application Web Installable) — volontairement minimalistes.
 *
 * Aucun impact sur la logique métier : ces utilitaires ne font que détecter
 * la possibilité d'installation, enregistrer le service worker, déclencher
 * l'invite native et mémoriser un éventuel refus de l'utilisateur.
 *
 * L'écoute de `beforeinstallprompt` est posée au chargement du module (donc
 * avant le premier rendu) : l'événement ne se déclenche qu'une fois le service
 * worker actif, mais il ne peut être rejoué. Le rater rendrait l'application
 * impossible à installer depuis le site.
 */

const DISMISS_KEY = 'ligan:install-dismissed'
/** On ne relance pas la bannière pendant 7 jours après un refus. */
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Événement Chromium déclenchant l'invite d'installation. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Publié quand l'invite native devient disponible (ou après installation). */
export const INSTALL_AVAILABLE_EVENT = 'ligan:install-available'
export const INSTALLED_EVENT = 'ligan:installed'

let deferredPrompt: BeforeInstallPromptEvent | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Empêche la mini-bannière native du navigateur : on affiche la nôtre.
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    window.dispatchEvent(new CustomEvent(INSTALL_AVAILABLE_EVENT))
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    window.dispatchEvent(new CustomEvent(INSTALLED_EVENT))
  })
}

/** L'application est-elle déjà lancée en mode application installée ? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // iOS Safari n'expose pas display-mode : on se base sur le flag interne.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function userAgent(): string {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent
}

/** Appareil iOS (iPhone, iPad, iPod) — y compris en mode « bureau ». */
export function isIos(): boolean {
  const ua = userAgent()
  return (
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)
  )
}

/** Safari iOS — le seul navigateur iOS à exposer `beforeinstallprompt`... */
export function isIosSafari(): boolean {
  const ua = userAgent()
  return isIos() && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

/** Navigateur Firefox (desktop ou mobile) : pas d'installation de PWA. */
export function isFirefox(): boolean {
  return /Firefox|FxiOS/.test(userAgent())
}

/** Navigateur mobile sous Android. */
export function isAndroid(): boolean {
  return /Android/.test(userAgent())
}

/** L'invite native est-elle disponible (et donc déclenchable au clic) ? */
export function canPromptInstall(): boolean {
  return deferredPrompt !== null
}

/** S'abonner aux changements d'état de l'installation (libre / installé). */
export function onInstallState(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(INSTALL_AVAILABLE_EVENT, callback)
  window.addEventListener(INSTALLED_EVENT, callback)
  return () => {
    window.removeEventListener(INSTALL_AVAILABLE_EVENT, callback)
    window.removeEventListener(INSTALLED_EVENT, callback)
  }
}

/**
 * Déclenche l'invite d'installation native du navigateur.
 * Renvoie `unavailable` si le navigateur ne propose pas d'installation
 * (Firefox, Safari hors PWA déjà installée…) : l'appelant affiche alors la
 * marche à suivre manuelle.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable'
  const prompt = deferredPrompt
  try {
    await prompt.prompt()
    const choice = await prompt.userChoice
    deferredPrompt = null
    return choice.outcome
  } catch {
    return 'unavailable'
  }
}

/** L'utilisateur a-t-il refusé l'invite récemment ? */
export function isDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const at = Number(raw)
    if (!Number.isFinite(at)) return false
    return Date.now() - at < DISMISS_TTL_MS
  } catch {
    return false
  }
}

export function dismissInstall(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    /* stockage indisponible : on ignore */
  }
}

/** Marche à suivre pour installer l'application, selon le navigateur. */
export function installInstructions(): { title: string; steps: string[] } {
  if (isIos()) {
    return {
      title: 'Installer LIGAN+ sur iPhone ou iPad',
      steps: [
        'Touchez le bouton « Partager » (carré avec une flèche vers le haut).',
        'Descendez la liste et touchez « Sur l’écran d’accueil ».',
        'Touchez « Ajouter » en haut à droite : LIGAN+ s’ouvre ensuite comme une application.',
      ],
    }
  }
  if (isFirefox()) {
    return {
      title: 'Installer LIGAN+',
      steps: [
        'Firefox ne permet pas encore d’installer une application web.',
        'Utilisez Chrome, Edge ou Safari : sur iPhone, « Partager » puis « Sur l’écran d’accueil ».',
      ],
    }
  }
  if (isAndroid()) {
    return {
      title: 'Installer LIGAN+',
      steps: [
        'Touchez le menu « ⋮ » en haut à droite de Chrome ou Edge.',
        'Choisissez « Installer l’application » (ou l’icône d’installation dans la barre d’adresse).',
        'Confirmez avec « Installer » : l’icône LIGAN+ apparaîtra dans vos applications.',
      ],
    }
  }
  return {
    title: 'Installer LIGAN+',
    steps: [
      'Dans Chrome ou Edge, cliquez sur l’icône d’installation (écran + flèche) à droite de la barre d’adresse.',
      'Sinon, ouvrez le menu « ⋮ » puis choisissez « Installer LIGAN+ ».',
      'Confirmez avec « Installer » : LIGAN+ s’ouvre ensuite dans sa propre fenêtre.',
    ],
  }
}

/**
 * Enregistre le service worker qui permet d'ouvrir l'application installée
 * sans connexion. Uniquement en production : en développement, le cache
 * masquerait les modifications en cours.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Le service worker est un bonus : son échec ne doit jamais
      // empêcher l'application de fonctionner.
    })
  })
}
