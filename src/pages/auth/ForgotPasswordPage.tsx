import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { ApiError } from '../../lib/api'
import { forgotPassword } from '../../services/auth'

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Adresse email requise').email('Adresse email invalide'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    try {
      await forgotPassword(values.email)
      setSent(true)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Mot de passe oublié</h1>
        <p className="text-sm text-text-secondary">
          Nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {sent ? (
          <>
            <Alert variant="success">
              Si un compte existe avec cette adresse email, un lien de réinitialisation a été
              envoyé (valable 1&nbsp;h).
            </Alert>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {formError ? <Alert variant="error">{formError}</Alert> : null}

            <FormField label="Adresse email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.fr"
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Envoyer le lien
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Vous vous souvenez de votre mot de passe&nbsp;?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  )
}