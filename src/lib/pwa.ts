/**
 * Helpers PWA (Application Web Installable) — volontairement minimalistes.
 *
 * Aucun impact sur la logique métier : ces utilitaires ne font que détecter
 * la possibilité d'installation, enregistrer le service worker et mémoriser un
 * éventuel refus de l'utilisateur.
 */

const DISMISS_KEY = 'ligan:install-dismissed'
/** On ne relance pas la bannière pendant 7 jours après un refus. */
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Événement Chromium déclenchant l'invite d'installation. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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

/** Safari iOS ne déclenche jamais `beforeinstallprompt` : on l'identifie à part. */
export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  return isIos && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
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
