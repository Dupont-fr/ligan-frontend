import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenLoader } from '../../components/shared/FullScreenLoader'
import type { UserRole } from '../../services/auth'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  requireRole?: UserRole[]
}

export function ProtectedRoute({ requireRole }: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullScreenLoader label="Connexion sécurisée…" />
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireRole && user && !requireRole.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}