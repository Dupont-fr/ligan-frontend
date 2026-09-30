import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Plus, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import {
  createUser,
  listUsers,
  removeUser,
  updateUser,
  type AdminUser,
  type AdminUserInput,
  type AdminUserUpdate,
} from '../../services/admin'
import type { UserRole } from '../../services/auth'

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
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: listUsers,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const createMutation = useMutation({
    mutationFn: (input: AdminUserInput) => createUser(input),
    onSuccess: () => {
      invalidate()
      setForm(emptyForm)
      setFormOpen(false)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Erreur lors de la création du compte')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminUserUpdate }) => updateUser(id, input),
    onSuccess: () => {
      invalidate()
      setRowError(null)
    },
    onError: (err) => {
      setRowError(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: removeUser,
    onSuccess: () => {
      invalidate()
      setPendingDelete(null)
      setRowError(null)
    },
    onError: (err) => {
      setRowError(err instanceof ApiError ? err.message : 'Erreur lors de la suppression')
      setPendingDelete(null)
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
    'h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-base text-text-primary outline-none placeholder:text-text-muted focus:border-primary'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Utilisateurs</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Consultez les comptes, changez un rôle (dont administrateur) et créez de nouveaux
            comptes actifs immédiatement.
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

      {rowError ? (
        <Alert variant="error" className="mt-4">
          {rowError}
        </Alert>
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
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.id === me?.id}
                updating={updateMutation.isPending}
                pending={pendingDelete === u.id}
                deleting={deleteMutation.isPending && pendingDelete === u.id}
                onUpdate={(input) => updateMutation.mutate({ id: u.id, input })}
                onAskDelete={() => setPendingDelete(u.id)}
                onCancelDelete={() => setPendingDelete(null)}
                onConfirmDelete={() => deleteMutation.mutate(u.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

interface UserRowProps {
  user: AdminUser
  isSelf: boolean
  updating: boolean
  pending: boolean
  deleting: boolean
  onUpdate: (input: AdminUserUpdate) => void
  onAskDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}

function UserRow({
  user,
  isSelf,
  updating,
  pending,
  deleting,
  onUpdate,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: UserRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-background/60">
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
          {isSelf ? <Badge variant="info">Vous</Badge> : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {user.email}
          {user.phone ? ` · ${user.phone}` : ''} · inscrit le {dateFmt.format(new Date(user.createdAt))}
        </p>
      </div>

      {pending ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-secondary">
            Supprimer « {user.firstName} {user.lastName} » et ses données ?
          </span>
          <Button size="sm" variant="danger" loading={deleting} onClick={onConfirmDelete}>
            Confirmer
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelDelete}>
            Non
          </Button>
        </div>
      ) : isSelf ? (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Votre compte
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <select
            value={user.role}
            disabled={updating}
            onChange={(e) => onUpdate({ role: e.target.value as UserRole })}
            aria-label={`Rôle de ${user.firstName} ${user.lastName}`}
            className="h-9 rounded-[var(--radius-sm)] border border-border bg-background px-2 text-sm text-text-primary outline-none focus:border-primary"
          >
            <option value="CUSTOMER">Client</option>
            <option value="PROFESSIONAL">Professionnel</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button
            type="button"
            disabled={updating}
            onClick={() => onUpdate({ isVerified: !user.isVerified })}
            className={`inline-flex h-9 items-center gap-1 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium transition-colors ${
              user.isVerified
                ? 'bg-success-light text-success hover:bg-success-light/70'
                : 'bg-warning-light text-warning hover:bg-warning-light/70'
            }`}
            title={user.isVerified ? 'Marquer comme non vérifié' : 'Marquer comme vérifié'}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {user.isVerified ? 'Vérifié' : 'Non vérifié'}
          </button>

          <button
            type="button"
            onClick={onAskDelete}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-error-light hover:text-error"
            aria-label={`Supprimer le compte de ${user.firstName} ${user.lastName}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </li>
  )
}
