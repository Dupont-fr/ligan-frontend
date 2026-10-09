import { useEffect } from 'react'

/** Titre + description meta de l'onglet (SEO on-page, rendu côté client). */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (!description) return
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [title, description])
}

/**
 * Balise structurée JSON-LD dynamique (fiche business) : une seule balise
 * `#ld-json-dynamic`, remplacée à chaque changement de données.
 */
export function useJsonLd(data: object | null) {
  useEffect(() => {
    if (!data) return
    const ID = 'ld-json-dynamic'
    document.getElementById(ID)?.remove()
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = ID
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
    return () => {
      document.getElementById(ID)?.remove()
    }
  }, [data])
}
