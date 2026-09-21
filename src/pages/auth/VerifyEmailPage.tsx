import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FullScreenLoader } from '../../components/shared/FullScreenLoader'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../features/auth/AuthContext'
import { verifyEmail } from '../../services/auth'

type VerifyState = 'verifying' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<VerifyState>('verifying')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { refreshUser, status } = useAuth()

  useEffect(() => {
    if (!token) return
    let cancelled = false

    const run = async () => {
      try {
        await verifyEmail(token)
        if (!cancelled) {
          setState('success')
          await refreshUser()
        }
      } catch (err) {
        if (!cancelled) {
          setState('error')
          setError(err instanceof ApiError ? err.message : 'Vérification impossible')
        }
      }
    }
    void run()

    return () => {
      cancelled = true
    }
  }, [token, refreshUser])

  if (!token) {
    return (
      <Card className="p-6 sm:p-8">
        <Alert variant="error">Lien de vérification manquant.</Alert>
        <Link to="/login" className="mt-4 block">
          <Button variant="outline" className="w-full">
            Retour à la connexion
          </Button>
        </Link>
      </Card>
    )
  }

  if (state === 'verifying') {
    return <FullScreenLoader label="Vérification de votre adresse email…" />
  }

  return (
    <Card className="p-6 sm:p-8">
      {state === 'success' ? (
        <>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">Email vérifié&nbsp;!</h1>
            <p className="text-sm text-text-secondary">
              Votre compte est activé. Vous pouvez accéder à votre espace.
            </p>
          </div>
          <div className="mt-6">
            {status === 'authenticated' ? (
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard', { replace: true })}>
                Accéder à mon espace
              </Button>
            ) : (
              <Link to="/login" className="block">
                <Button size="lg" className="w-full">
                  Se connecter
                </Button>
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <Alert variant="error">{error ?? 'Impossible de vérifier votre adresse email.'}</Alert>
          <Link to="/login" className="mt-4 block">
            <Button variant="outline" className="w-full">
              Retour à la connexion
            </Button>
          </Link>
        </>
      )}
    </Card>
  )
}