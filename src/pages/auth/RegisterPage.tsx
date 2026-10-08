import { zodResolver } from '@hookform/resolvers/zod'
import { BriefcaseBusiness, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { PasswordChecklist } from '../../components/ui/PasswordChecklist'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'

const schema = z
  .object({
    role: z.enum(['CUSTOMER', 'PROFESSIONAL']),
    firstName: z
      .string()
      .trim()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(60),
    lastName: z
      .string()
      .trim()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(60),
    email: z.string().trim().toLowerCase().email('Adresse email invalide'),
    phone: z
      .string()
      .trim()
      .regex(
        /^[0-9\s().-]{8,15}$/,
        'Numéro de téléphone invalide (8 chiffres minimum)',
      )
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(128, 'Le mot de passe est trop long')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(
        /[0-9]|[^A-Za-z0-9]/,
        'Le mot de passe doit contenir au moins un chiffre ou un caractère spécial',
      ),
    confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const roleOptions = [
  {
    value: 'CUSTOMER' as const,
    icon: Search,
    title: 'Je cherche un professionnel',
    text: 'Cherchez des pros près de chez vous et contactez-les.',
  },
  {
    value: 'PROFESSIONAL' as const,
    icon: BriefcaseBusiness,
    title: 'Je suis professionnel',
    text: 'Publiez vos services et recevez des demandes.',
  },
]

export function RegisterPage() {
  const { register: registerUser, status } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPasswordTip, setShowPasswordTip] = useState(false)

  const {
    register,
    watch,
    control,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'CUSTOMER',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  const selectedRole = useWatch({ control, name: 'role' })

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'PROFESSIONAL' || roleParam === 'CUSTOMER') {
      setValue('role', roleParam)
    }
  }, [searchParams, setValue])

  if (status === 'authenticated') {
    return <Navigate to='/dashboard' replace />
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone
          ? `+237${values.phone.replace(/\D/g, '')}`
          : undefined,
        password: values.password,
        role: values.role,
      })
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`)
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Une erreur est survenue',
      )
    }
  }

  // Mot de passe suggéré : aléatoire, 14 caractères, une majuscule,
  // une minuscule, un chiffre et un symbole (toutes les règles du formulaire).
  const handleSuggestPassword = () => {
    const sets = [
      'abcdefghijkmnpqrstuvwxyz',
      'ABCDEFGHJKLMNPQRSTUVWXYZ',
      '23456789',
      '!@#$%^&*?-_=+',
    ]
    const all = sets.join('')
    const rand = (max: number) => {
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      return buf[0] % max
    }
    const chars = sets.map((set) => set[rand(set.length)])
    while (chars.length < 14) chars.push(all[rand(all.length)])
    for (let i = chars.length - 1; i > 0; i--) {
      const j = rand(i + 1)
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    const generated = chars.join('')
    setValue('password', generated, { shouldValidate: false })
    setValue('confirmPassword', generated, { shouldValidate: false })
    void trigger(['password', 'confirmPassword'])
    setShowPasswordTip(false)
  }

  return (
    <Card className='p-6 sm:p-8'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold text-text-primary'>
          Créer un compte
        </h1>
        <p className='text-sm text-text-secondary'>
          Créez votre compte pour contacter des professionnels ou publier vos
          propres services.
        </p>
      </div>

      <div
        className='mt-5 grid gap-3 sm:grid-cols-2'
        role='radiogroup'
        aria-label='Type de compte'
      >
        {roleOptions.map((opt) => {
          const active = (selectedRole ?? 'CUSTOMER') === opt.value
          return (
            <button
              key={opt.value}
              type='button'
              role='radio'
              aria-checked={active}
              onClick={() =>
                setValue('role', opt.value, { shouldValidate: true })
              }
              className={`rounded-[var(--radius-md)] border p-4 text-left transition-all duration-200 ease-out ${
                active
                  ? 'border-primary bg-primary-light shadow-[var(--shadow-sm)]'
                  : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-md)]'
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${
                  active
                    ? 'bg-primary text-primary-contrast'
                    : 'bg-border-light text-text-secondary'
                }`}
              >
                <opt.icon className='h-4.5 w-4.5' aria-hidden />
              </span>
              <p className='mt-2 text-sm font-semibold text-text-primary'>
                {opt.title}
              </p>
              <p className='mt-0.5 text-xs text-text-secondary'>{opt.text}</p>
            </button>
          )
        })}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className='mt-6 space-y-4'
      >
        {formError ? <Alert variant='error'>{formError}</Alert> : null}

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            label='Prénom'
            htmlFor='firstName'
            error={errors.firstName?.message}
          >
            <Input
              id='firstName'
              type='text'
              autoComplete='given-name'
              placeholder='Maurice'
              error={Boolean(errors.firstName)}
              {...register('firstName')}
            />
          </FormField>

          <FormField
            label='Nom'
            htmlFor='lastName'
            error={errors.lastName?.message}
          >
            <Input
              id='lastName'
              type='text'
              autoComplete='family-name'
              placeholder='Kamto'
              error={Boolean(errors.lastName)}
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField
          label='Adresse email'
          htmlFor='email'
          error={errors.email?.message}
        >
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='vous@exemple.fr'
            error={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField
          label='Téléphone'
          htmlFor='phone'
          error={errors.phone?.message}
          hint='Optionnel — pour être contacté par les professionnels.'
        >
          <div className='relative'>
            <span
              className='pointer-events-none absolute inset-y-0 left-0 flex select-none items-center border-r border-border bg-surface px-3 text-sm font-medium text-text-secondary'
              aria-hidden
            >
              +237
            </span>
            <Input
              id='phone'
              type='tel'
              inputMode='tel'
              autoComplete='tel-national'
              placeholder='6 90 00 00 00'
              error={Boolean(errors.phone)}
              className='pl-[4.4rem]'
              {...register('phone')}
            />
          </div>
        </FormField>

        <FormField
          label='Mot de passe'
          htmlFor='password'
          error={errors.password?.message}
        >
          <PasswordInput
            id='password'
            autoComplete='new-password'
            placeholder='8 caractères minimum'
            error={Boolean(errors.password)}
            {...register('password')}
            onFocus={() => setShowPasswordTip(true)}
          />
          {showPasswordTip ? (
            <Alert variant='info' className='mt-2'>
              <span className='flex flex-wrap items-center justify-between gap-2'>
                <span>
                  Créez votre propre mot de passe, ou demandez-nous une
                  suggestion forte.
                </span>
                <span className='flex shrink-0 items-center gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleSuggestPassword}
                  >
                    Suggérer un mot de passe fort
                  </Button>
                  <button
                    type='button'
                    aria-label="Masquer l'astuce"
                    onClick={() => setShowPasswordTip(false)}
                    className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-background hover:text-text-primary'
                  >
                    <X className='h-4 w-4' aria-hidden />
                  </button>
                </span>
              </span>
            </Alert>
          ) : null}
          <PasswordChecklist password={watch('password')} />
        </FormField>

        <FormField
          label='Confirmer le mot de passe'
          htmlFor='confirmPassword'
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id='confirmPassword'
            autoComplete='new-password'
            placeholder='••••••••'
            error={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button
          type='submit'
          size='lg'
          className='w-full'
          loading={isSubmitting}
        >
          Créer mon compte
        </Button>
      </form>

      <p className='mt-6 text-center text-sm text-text-secondary'>
        Déjà un compte&nbsp;?{' '}
        <Link to='/login' className='font-medium text-primary hover:underline'>
          Se connecter
        </Link>
      </p>
    </Card>
  )
}
