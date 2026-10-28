import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'
import { InstallButton } from '../InstallButton'
import { Logo } from './Logo'

const columns = [
  {
    title: 'À propos',
    links: [
      { label: 'Notre histoire', to: '/a-propos' },
      { label: 'Comment ça marche', to: '/#how' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Pour les pros',
    links: [
      { label: 'Devenir pro', to: '/register?role=PROFESSIONAL' },
      { label: 'Tarifs & plans', to: '/tarifs' },
      { label: 'Espace pro', to: '/dashboard' },
    ],
  },
  {
    title: 'Aide & Légal',
    links: [
      { label: "Centre d'aide", to: '/aide' },
      { label: "Conditions d'utilisation", to: '/conditions' },
      { label: 'Confidentialité', to: '/confidentialite' },
    ],
  },
  {
    title: 'Partenaire',
    links: [
      { label: 'DupontTech CM', to: 'https://dupontdjeague.de5.net', external: true as const },
    ],
  },
]

export function SiteFooter() {
  const categories = useCategories()
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="space-y-3 col-span-2 lg:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-text-secondary">
            La plateforme qui met en relation les clients et les professionnels locaux :
            artisans, services à domicile, bien-être et plus encore.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Trouvez les professionnels près de vous.
          </p>
          <InstallButton className="pt-1" />
        </div>

        <div className="contents sm:contents md:grid md:grid-cols-4 md:col-span-3 lg:grid lg:grid-cols-4 lg:col-span-4 lg:gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold text-text-primary">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary transition-colors hover:text-primary"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-text-secondary transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-text-muted sm:flex-row">
          <span>© 2026 LIGAN+ — Tous droits réservés.</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.slice(0, 5).map((cat) => (
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
