import { FolderTree, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
]

export function AdminTabs() {
  return (
    <nav className="mt-6 flex gap-1 border-b border-border" aria-label="Sections d'administration">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`
          }
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
