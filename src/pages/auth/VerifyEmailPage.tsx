import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import { resendCode } from '../../services/auth'

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Adresse email requise').email('Adresse email invalide'),
  code: z.string().trim().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres'),
})

type FormValues = z.infer<typeof schema>

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''
  const { verifyAccount, status } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail, code: '' },
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    try {
      await verifyAccount(values.email, values.code)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  const handleResend = async () => {
    const email = getValues('email')
    if (!email) return
    setFormError(null)
    try {
      await resendCode(email, 'verify')
      setCooldown(60)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Impossible de renvoyer le code')
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Vérifie ton adresse email</h1>
        <p className="text-sm text-text-secondary">
          Un code à 6 chiffres a été envoyé à <strong>{initialEmail}</strong>. Saisis-le ci-dessous
          pour activer ton compte.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <FormField label="Adresse email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField label="Code de vérification" htmlFor="code" error={errors.code?.message}>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            autoFocus
            maxLength={6}
            className="text-center text-lg tracking-[0.5em]"
            error={Boolean(errors.code)}
            {...register('code')}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Vérifier et me connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Vous ne recevez pas le code&nbsp;?{' '}
        <button
          type="button"
          disabled={cooldown > 0}
          onClick={handleResend}
          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-muted"
        >
          {cooldown > 0 ? `Renvoyer dans ${cooldown} s` : 'Renvoyer le code'}
        </button>
      </p>

      <p className="mt-2 text-center text-sm text-text-secondary">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </Card>
  )
}