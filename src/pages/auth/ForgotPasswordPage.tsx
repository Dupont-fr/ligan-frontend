import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

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
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Mot de passe oublié</h1>
        <p className="text-sm text-text-secondary">
          Entrez votre adresse email : nous vous enverrons un code pour choisir un nouveau mot de
          passe.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
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
          Envoyer le code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Vous vous souvenez de votre mot de passe&nbsp;?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  )
}