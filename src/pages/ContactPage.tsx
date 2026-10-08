import { Clock, Copy, LifeBuoy, Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'

const SUPPORT_EMAIL = 'support@ligan.plus'
const Email = 'dupontdjeague@gmail.com'
const subjects = [
  'Question générale',
  'Devenir professionnel',
  'Mon compte',
  'Paiements et abonnements',
  'Signaler un problème',
  'Partenariat',
]

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(subjects[0])
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    message?: string
  }>({})
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Indiquez votre nom.'
    if (!/^\S+@\S+\.\S+$/.test(email))
      nextErrors.email = 'Adresse e-mail invalide.'
    if (message.trim().length < 10)
      nextErrors.message = 'Décrivez votre demande (10 caractères minimum).'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const body = `Bonjour,\n\n${message.trim()}\n\n— ${name.trim()} (${email.trim()})`
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[LIGAN+] ${subject}`)}&body=${encodeURIComponent(body)}`
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className='has-bottom-nav flex min-h-dvh flex-col'>
      <SiteHeader />

      <main className='flex-1'>
        {/* Hero */}
        <section className='border-b border-border bg-gradient-to-b from-primary-light to-background'>
          <div className='mx-auto w-full max-w-4xl px-4 py-12 text-center sm:py-16'>
            <span className='inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-primary/30 bg-surface px-3 py-1 text-xs font-medium text-primary'>
              <Mail className='h-3.5 w-3.5' aria-hidden />
              On vous répond
            </span>
            <h1 className='mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl'>
              Contactez <span className='text-secondary'>LIGAN+</span>
            </h1>
            <p className='mx-auto mt-3 max-w-2xl text-sm text-text-secondary sm:text-base'>
              Une question sur votre compte, un problème technique ou une envie
              de collaborer ? Écrivez-nous, l’équipe lit tous les messages.
            </p>
          </div>
        </section>

        <section className='mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 lg:grid-cols-5'>
          {/* Coordonnées */}
          <div className='space-y-4 lg:col-span-2'>
            <Card className='p-5'>
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary'>
                <Mail className='h-5 w-5' aria-hidden />
              </span>
              <h2 className='mt-3 text-sm font-semibold text-text-primary'>
                Par e-mail
              </h2>
              <div className='mt-1.5 flex items-center gap-2'>
                <a
                  href={`mailto:${Email}`}
                  className='break-all text-sm font-medium text-primary hover:underline'
                >
                  {SUPPORT_EMAIL}
                </a>
                <button
                  type='button'
                  onClick={copyEmail}
                  className='inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-background hover:text-text-primary'
                  aria-label='Copier l’adresse e-mail'
                >
                  <Copy className='h-4 w-4' aria-hidden />
                </button>
              </div>
              {copied ? (
                <p className='mt-1 text-xs text-secondary'>Adresse copiée !</p>
              ) : null}
            </Card>

            <Card className='p-5'>
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary'>
                <Clock className='h-5 w-5' aria-hidden />
              </span>
              <h2 className='mt-3 text-sm font-semibold text-text-primary'>
                Délai de réponse
              </h2>
              <p className='mt-1.5 text-sm leading-relaxed text-text-secondary'>
                Sous 24 à 48 heures ouvrées. Pour une question urgente,
                consultez d’abord le centre d’aide : la plupart des réponses y
                sont déjà.
              </p>
            </Card>

            <Card className='p-5'>
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary'>
                <LifeBuoy className='h-5 w-5' aria-hidden />
              </span>
              <h2 className='mt-3 text-sm font-semibold text-text-primary'>
                Centre d’aide
              </h2>
              <p className='mt-1.5 text-sm leading-relaxed text-text-secondary'>
                Comptes, recherche, plans et paiements : les réponses aux
                questions fréquentes sont regroupées dans le centre d’aide.
              </p>
              <Link
                to='/aide'
                className='mt-2 inline-flex text-sm font-medium text-primary hover:underline'
              >
                Consulter le centre d’aide →
              </Link>
            </Card>
          </div>

          {/* Formulaire */}
          <Card className='p-5 lg:col-span-3'>
            <h2 className='text-base font-semibold text-text-primary'>
              Envoyer un message
            </h2>
            <p className='mt-1 text-sm text-text-secondary'>
              Votre messagerie s’ouvrira avec le message pré-rempli : il ne
              reste qu’à l’envoyer.
            </p>

            <form className='mt-5 space-y-4' onSubmit={handleSubmit} noValidate>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  label='Votre nom'
                  htmlFor='contact-name'
                  error={errors.name}
                >
                  <Input
                    id='contact-name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Ex. Maurice Kamto'
                    autoComplete='name'
                  />
                </FormField>
                <FormField
                  label='Votre e-mail'
                  htmlFor='contact-email'
                  error={errors.email}
                >
                  <Input
                    id='contact-email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='vous@exemple.com'
                    autoComplete='email'
                  />
                </FormField>
              </div>

              <FormField label='Sujet' htmlFor='contact-subject'>
                <select
                  id='contact-subject'
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className='flex h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-base text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label='Message'
                htmlFor='contact-message'
                error={errors.message}
              >
                <textarea
                  id='contact-message'
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='Décrivez votre demande en quelques lignes…'
                  className='w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
                />
              </FormField>

              <Alert variant='info'>
                Aucune donnée n’est envoyée avant l’ouverture de votre logiciel
                de messagerie.
              </Alert>

              <Button type='submit' size='lg' className='w-full'>
                <Send className='h-4 w-4' aria-hidden />
                Envoyer le message
              </Button>
            </form>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
