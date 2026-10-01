import { BarChart3, ClipboardCheck, FolderTree, Gauge, Home, LayoutGrid, Users } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { WorkspaceShell } from '../../components/layout/WorkspaceShell'

const navItems = [
  { to: '/admin', label: 'Tableau de bord', icon: Gauge, end: true, crumb: 'Aperçu' },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users, end: false, crumb: 'Utilisateurs' },
  { to: '/admin/activities', label: 'Activités', icon: ClipboardCheck, end: false, crumb: 'Activités' },
  { to: '/admin/analytics', label: 'Statistiques', icon: BarChart3, end: false, crumb: 'Statistiques' },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree, end: false, crumb: 'Catégories' },
]

export function AdminLayout() {
  const { pathname } = useLocation()
  const current = navItems.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))

  return (
    <WorkspaceShell
      breadcrumb={['Administration', current?.crumb ?? 'Espace']}
      groups={[
        { label: 'Plateforme', items: navItems.map(({ to, label, icon, end }) => ({
          to,
          label,
          icon,
          active: end ? pathname === to : pathname.startsWith(to),
        })) },
        { label: 'Retour', items: [
          { to: '/dashboard', label: 'Mon espace', icon: LayoutGrid },
          { to: '/', label: 'Accueil du site', icon: Home },
        ] },
      ]}
    >
      <Outlet />
    </WorkspaceShell>
  )
}
