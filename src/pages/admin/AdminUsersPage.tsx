import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, UserPlus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { SiteFooter } from '../../components/layout/SiteFooter'
import { SiteHeader } from '../../components/layout/SiteHeader'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ApiError } from '../../lib/api'
import { createUser, listUsers, type AdminUserInput } from '../../services/admin'
import type { UserRole } from '../../services/auth'
import { AdminTabs } from './AdminTabs'

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: UserRole
}

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'CUSTOMER',
}

const roleLabels: Record<UserRole, string> = {
  CUSTOMER: 'Client',
  PROFESSIONAL: 'Professionnel',
  ADMIN: 'Administrateur',
}

const roleBadges: Record<UserRole, BadgeVariant> = {
  CUSTOMER: 'neutral',
  PROFESSIONAL: 'secondary',
  ADMIN: 'promo',
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: listUsers,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (input: AdminUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setForm(emptyForm)
      setFormOpen(false)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Erreur lors de la création du compte')
    },
  })

  const users = data?.users ?? []

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const phoneDigits = form.phone.replace(/\D/g, '')
    createMutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      ...(phoneDigits ? { phone: `+237${phoneDigits}` } : {}),
      password: form.password,
      role: form.role,
    })
  }

  const inputClass =
    'h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary'

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Utilisateurs</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Consultez les comptes de la plateforme et créez-en de nouveaux, dont des
                administrateurs.
              </p>
            </div>
            <Button
              onClick={() => {
                setForm(emptyForm)
                setFormError(null)
                setFormOpen((open) => !open)
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nouveau compte
            </Button>
          </div>

          <AdminTabs />

          {formOpen ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-text-primary">Créer un compte</h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                  aria-label="Fermer le formulaire"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {formError ? (
                <Alert variant="error" className="mt-3">
                  {formError}
                </Alert>
              ) : null}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="user-firstname" className="mb-1 block text-sm font-medium text-text-primary">
                    Prénom *
                  </label>
                  <input
                    id="user-firstname"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="Ex : Sophie"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="user-lastname" className="mb-1 block text-sm font-medium text-text-primary">
                    Nom *
                  </label>
                  <input
                    id="user-lastname"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="Ex : Ngono"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="user-email" className="mb-1 block text-sm font-medium text-text-primary">
                    Email *
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    maxLength={254}
                    placeholder="prenom.nom@exemple.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="user-phone" className="mb-1 block text-sm font-medium text-text-primary">
                    Téléphone
                  </label>
                  <div className="relative">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 flex select-none items-center border-r border-border bg-surface px-3 text-sm font-medium text-text-secondary"
                    >
                      +237
                    </span>
                    <input
                      id="user-phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="6 90 00 00 00"
                      maxLength={15}
                      className={`${inputClass} pl-[4.4rem]`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="user-password" className="mb-1 block text-sm font-medium text-text-primary">
                    Mot de passe *
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="8 caractères min., majuscule incluse"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-text-primary">
                    Rôle *
                  </label>
                  <select
                    id="user-role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                    className={inputClass}
                  >
                    <option value="CUSTOMER">Client</option>
                    <option value="PROFESSIONAL">Professionnel</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>

              <p className="mt-3 text-xs text-text-muted">
                Un compte créé ici est actif immédiatement, sans vérification par code.
              </p>

              <div className="mt-4 flex gap-2">
                <Button type="submit" loading={createMutation.isPending}>
                  Créer le compte
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-background" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-text-primary">Impossible de charger les comptes</p>
                <p className="mt-1 text-sm text-text-secondary">Réessayez plus tard.</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-text-primary">Aucun compte</p>
              </div>
            ) : (
              <ul>
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-background/60"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-light text-primary">
                      <UserPlus className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">
                          {user.firstName} {user.lastName}
                        </span>
                        <Badge variant={roleBadges[user.role]}>{roleLabels[user.role]}</Badge>
                        {!user.isVerified ? <Badge variant="warning">Non vérifié</Badge> : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {user.email}
                        {user.phone ? ` · ${user.phone}` : ''} · inscrit le{' '}
                        {dateFmt.format(new Date(user.createdAt))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
