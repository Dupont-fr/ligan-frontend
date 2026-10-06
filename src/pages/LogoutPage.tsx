import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { FullScreenLoader } from '../components/shared/FullScreenLoader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

/**
 * Confirmation de déconnexion — le bouton « Déconnexion » amène ici,
 * la session n'est close qu'après confirmation explicite.
 */
export function LogoutPage() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  if (status === 'loading') {
    return <FullScreenLoader label="Connexion sécurisée…" />
  }
  if (status === 'guest') {
    return <Navigate to="/login" replace />
  }

  const handleConfirm = async () => {
    setBusy(true)
    try {
      navigate('/', { replace: true })
      await logout()
    } catch {
      // logout() vide l'état local dans son finally, même si l'API est injoignable.
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <Card className="p-6 text-center sm:p-8">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
        <LogOut className="h-7 w-7" aria-hidden />
      </span>

      <div className="mt-4 space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Se déconnecter ?</h1>
        <p className="text-sm text-text-secondary">
          {user ? <span className="font-medium text-text-primary">{user.email}</span> : null}
          {user ? <br /> : null}
          Votre session sera fermée sur cet appareil. Vos données restent intactes : vous pourrez
          vous reconnecter à tout moment.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button onClick={handleConfirm} loading={busy}>
          Se déconnecter
        </Button>
        <Button variant="outline" onClick={handleCancel} disabled={busy}>
          Rester connecté
        </Button>
      </div>
    </Card>
  )
}
