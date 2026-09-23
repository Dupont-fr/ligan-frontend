import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../lib/categories'
import { Logo } from './Logo'

const columns = [
  {
    title: 'À propos',
    links: [
      { label: 'Notre histoire', to: '/' },
      { label: 'Comment ça marche', to: '/#how' },
      { label: 'Contact', to: '/' },
    ],
  },
  {
    title: 'Pour les pros',
    links: [
      { label: 'Devenir pro', to: '/register?role=PROFESSIONAL' },
      { label: 'Espace pro', to: '/dashboard' },
      { label: 'Mes sollicitations', to: '/dashboard' },
    ],
  },
  {
    title: 'Aide & Légal',
    links: [
      { label: "Centre d'aide", to: '/' },
      { label: 'Conditions d’utilisation', to: '/' },
      { label: 'Confidentialité', to: '/' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-text-secondary">
            Le canal <span className="font-semibold text-primary">+</span> qui relie les clients aux
            professionnels locaux : artisans, services à domicile, bien-être et plus encore.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold text-text-primary">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-text-muted sm:flex-row">
          <span>© 2026 Ligan+ — Tous droits réservés.</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                to={`/trouver?categorie=${encodeURIComponent(cat.label)}`}
                className="transition-colors hover:text-primary"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
