import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { ApiError } from '../../lib/api'
import { resendCode, resetPassword, verifyResetCode } from '../../services/auth'

const codeSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Adresse email requise').email('Adresse email invalide'),
  code: z.string().trim().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres'),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
    confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type CodeValues = z.infer<typeof codeSchema>
type PasswordValues = z.infer<typeof passwordSchema>

type Stage = 'code' | 'password' | 'done'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''
  const [stage, setStage] = useState<Stage>('code')
  const [formError, setFormError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')

  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { email: initialEmail, code: '' },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const onCodeSubmit = async (values: CodeValues) => {
    setFormError(null)
    try {
      await verifyResetCode(values.email, values.code)
      setEmail(values.email)
      setCode(values.code)
      setStage('password')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  const onPasswordSubmit = async (values: PasswordValues) => {
    setFormError(null)
    try {
      await resetPassword(email, code, values.password)
      setStage('done')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  const handleResend = async () => {
    const currentEmail = codeForm.getValues('email')
    if (!currentEmail) return
    setFormError(null)
    try {
      await resendCode(currentEmail, 'reset')
      setCooldown(60)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Impossible de renvoyer le code')
    }
  }

  if (stage === 'done') {
    return (
      <Card className="p-6 sm:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">Mot de passe réinitialisé</h1>
          <p className="text-sm text-text-secondary">
            Toutes vos sessions ont été déconnectées. Vous pouvez vous connecter avec votre nouveau
            mot de passe.
          </p>
        </div>
        <Link to="/login" className="mt-6 block">
          <Button size="lg" className="w-full">
            Se connecter
          </Button>
        </Link>
      </Card>
    )
  }

  if (stage === 'password') {
    return (
      <Card className="p-6 sm:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">Nouveau mot de passe</h1>
          <p className="text-sm text-text-secondary">
            Code validé pour <strong>{email}</strong>. Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="mt-6 space-y-4">
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <FormField label="Nouveau mot de passe" htmlFor="password" error={passwordForm.formState.errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              error={Boolean(passwordForm.formState.errors.password)}
              {...passwordForm.register('password')}
            />
          </FormField>

          <FormField
            label="Confirmer le mot de passe"
            htmlFor="confirmPassword"
            error={passwordForm.formState.errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              error={Boolean(passwordForm.formState.errors.confirmPassword)}
              {...passwordForm.register('confirmPassword')}
            />
          </FormField>

          <Button type="submit" size="lg" className="w-full" loading={passwordForm.formState.isSubmitting}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">Code de réinitialisation</h1>
        <p className="text-sm text-text-secondary">
          Un code à 6 chiffres a été envoyé par email. Saisissez-le pour choisir un nouveau mot de
          passe.
        </p>
      </div>

      <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} noValidate className="mt-6 space-y-4">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <FormField label="Adresse email" htmlFor="email" error={codeForm.formState.errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={Boolean(codeForm.formState.errors.email)}
            {...codeForm.register('email')}
          />
        </FormField>

        <FormField label="Code à 6 chiffres" htmlFor="code" error={codeForm.formState.errors.code?.message}>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            autoFocus
            maxLength={6}
            className="text-center text-lg tracking-[0.5em]"
            error={Boolean(codeForm.formState.errors.code)}
            {...codeForm.register('code')}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={codeForm.formState.isSubmitting}>
          Valider le code
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