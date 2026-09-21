import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'

const schema = z
  .object({
    firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères').max(60),
    lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(60),
    email: z.string().trim().toLowerCase().email('Adresse email invalide'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s().-]{8,20}$/, 'Numéro de téléphone invalide')
      .optional()
      .or(z.literal('')),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
    confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser, status } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      })
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Créer un compte</h1>
        <p className="text-sm text-text-secondary">
          Rejoignez Ligan+ pour découvrir les professionnels locaux.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Prénom" htmlFor="firstName" error={errors.firstName?.message}>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Jean"
              error={Boolean(errors.firstName)}
              {...register('firstName')}
            />
          </FormField>

          <FormField label="Nom" htmlFor="lastName" error={errors.lastName?.message}>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Dupont"
              error={Boolean(errors.lastName)}
              {...register('lastName')}
            />
          </FormField>
        </div>

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

        <FormField
          label="Téléphone"
          htmlFor="phone"
          error={errors.phone?.message}
          hint="Optionnel — pour être contacté par les professionnels."
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+237 6 90 00 00 00"
            error={Boolean(errors.phone)}
            {...register('phone')}
          />
        </FormField>

        <FormField label="Mot de passe" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
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
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            error={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Déjà un compte&nbsp;?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  )
}