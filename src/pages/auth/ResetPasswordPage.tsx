import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { ApiError } from '../../lib/api'
import { resetPassword } from '../../services/auth'

const schema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
    confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    setFormError(null)
    try {
      await resetPassword(token, values.password)
      setDone(true)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  if (!token) {
    return (
      <Card className="p-6 sm:p-8">
        <Alert variant="error">Lien de réinitialisation invalide.</Alert>
        <Link to="/forgot-password" className="mt-4 block">
          <Button variant="outline" className="w-full">
            Demander un nouveau lien
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Nouveau mot de passe</h1>
        <p className="text-sm text-text-secondary">Choisissez un mot de passe sécurisé.</p>
      </div>

      <div className="mt-6 space-y-4">
        {done ? (
          <>
            <Alert variant="success">
              Mot de passe réinitialisé. Toutes vos sessions ont été déconnectées.
            </Alert>
            <Link to="/login">
              <Button size="lg" className="w-full">
                Se connecter
              </Button>
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {formError ? <Alert variant="error">{formError}</Alert> : null}

            <FormField label="Nouveau mot de passe" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                error={Boolean(errors.password)}
                {...register('password')}
              />
            </FormField>

            <FormField
              label="Confirmer le mot de passe"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={Boolean(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Réinitialiser le mot de passe
            </Button>
          </form>
        )}
      </div>
    </Card>
  )
}