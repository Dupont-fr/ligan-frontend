import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Remet le scroll en haut à chaque changement de page.
 *
 * Sans ceci, un clic sur un lien du footer ouvre la nouvelle page en restant
 * à la position de défilement précédente (le footer est en bas : on atterrit
 * au milieu de la page et il faut remonter à la main).
 *
 * Exception : un lien avec une ancre (`/#how`) n'est pas remonté ici — la
 * page cible se charge à son propre endroit via son `useEffect` sur `hash`.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    // `behavior: 'instant'` : on ne veut pas d'animation de défilement à travers
    // toute la page lors d'un changement de route.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
