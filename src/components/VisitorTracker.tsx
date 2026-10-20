import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackVisit } from '../services/analytics'

/**
 * Enregistre chaque page vue du site public (une par changement de chemin).
 *
 * Exclus : l'espace admin (trafic interne, ne doit pas gonfler les statistiques)
 * et les navigateurs qui demandent le non-suivi (Do Not Track).
 */
export function VisitorTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Pas de tracking en développement : le backend local peut viser la base
    // de production, les rechargements pollueraient les statistiques.
    if (import.meta.env.DEV) return
    if (pathname.startsWith('/admin')) return
    if (navigator.doNotTrack === '1') return
    trackVisit(pathname)
  }, [pathname])

  return null
}
