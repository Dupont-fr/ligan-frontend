import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity as ActivityIcon,
  Check,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityCard } from '../../components/activities/ActivityCard'
import { ActivityWizard } from '../../components/activities/ActivityWizard'
import { WorkspaceShell, type ShellGroup } from '../../components/layout/WorkspaceShell'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import {
  deleteActivity,
  listActivities,
  listMyActivities,
  type Activity,
} from '../../services/activities'
import {
  listMySolicitations,
  updateSolicitation,
} from '../../services/solicitations'
import { deleteAccount, updateMe } from '../../services/auth'
import type { Solicitation } from '../../services/solicitations'

const roleLabels: Record<string, string> = {
  CUSTOMER: 'Client',
  PROFESSIONAL: 'Professionnel',
  ADMIN: 'Administrateur',
}

const statusLabels: Record<Solicitation['status'], { label: string; variant: 'info' | 'success' | 'error' }> = {
  PENDING: { label: 'En attente', variant: 'info' },
  ACCEPTED: { label: 'Acceptée', variant: 'success' },
  DECLINED: { label: 'Refusée', variant: 'error' },
}

type Section = 'feed' | 'activities' | 'solicitations' | 'settings'

export function DashboardPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isPro = user?.role === 'PROFESSIONAL'
  const [section, setSection] = useState<Section>('feed')

  const navItems: { id: Section; label: string; icon: typeof LayoutGrid; proOnly?: boolean }[] = [
    { id: 'feed', label: 'Fil d’activité', icon: LayoutGrid },
    { id: 'activities', label: 'Mes activités', icon: ActivityIcon, proOnly: true },
    { id: 'solicitations', label: 'Mes sollicitations', icon: UserRound },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]
  const visibleNav = navItems.filter((item) => !item.proOnly || isPro)

  const feedQuery = useQuery({
    queryKey: ['activities', 'feed'],
    queryFn: () => listActivities(),
    enabled: section === 'feed',
  })

  const myActivitiesQuery = useQuery({
    queryKey: ['activities', 'mine'],
    queryFn: listMyActivities,
    enabled: section === 'activities' && isPro,
  })

  const solicitationsQuery = useQuery({
    queryKey: ['solicitations'],
    queryFn: listMySolicitations,
    enabled: section === 'solicitations',
  })

  const shellGroups: ShellGroup[] = [
    {
      items: visibleNav.map((item) => ({
        label: item.label,
        icon: item.icon,
        active: section === item.id,
        onClick: () => setSection(item.id),
      })),
    },
    {
      label: 'Explorer',
      items: [
        { label: 'Trouver un pro', icon: Search, to: '/trouver' },
        ...(user?.role === 'ADMIN'
          ? [{ label: 'Administration', icon: ShieldCheck, to: '/admin' }]
          : []),
      ],
    },
  ]

  const currentCrumb = visibleNav.find((item) => item.id === section)?.label ?? ''

  return (
    <WorkspaceShell
      groups={shellGroups}
      breadcrumb={['Espace ' + roleLabels[user?.role ?? 'CUSTOMER'], currentCrumb]}
    >
      {section === 'feed' ? (
        <FeedSection
          activities={feedQuery.data?.activities ?? []}
          isLoading={feedQuery.isLoading}
          currentUserId={user?.id}
          isPro={isPro}
          onManage={() => setSection('activities')}
        />
      ) : null}

      {section === 'activities' && isPro ? (
        <MyActivitiesSection
          activities={myActivitiesQuery.data?.activities ?? []}
          isLoading={myActivitiesQuery.isLoading}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ['activities'] })}
        />
      ) : null}

      {section === 'solicitations' ? (
        <SolicitationsSection
          received={solicitationsQuery.data?.received ?? []}
          sent={solicitationsQuery.data?.sent ?? []}
          isLoading={solicitationsQuery.isLoading}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ['solicitations'] })}
        />
      ) : null}

      {section === 'settings' ? <SettingsSection /> : null}
    </WorkspaceShell>
  )
}

function FeedSection({
  activities,
  isLoading,
  currentUserId,
  isPro,
  onManage,
}: {
  activities: { id: string }[] & Parameters<typeof ActivityCard>[0]['activity'][]
  isLoading: boolean
  currentUserId?: string
  isPro: boolean
  onManage: () => void
}) {
  const typed = activities as Parameters<typeof ActivityCard>[0]['activity'][]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Fil d’activité</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Les dernières activités publiées par les professionnels. Ouvrez une fiche pour leur
            envoyer une demande.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/trouver">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4" aria-hidden />
              Trouver un pro
            </Button>
          </Link>
          {isPro ? (
            <Button variant="outline" size="sm" onClick={onManage}>
              Gérer mes activités
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
          ))}
        </div>
      ) : typed.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <p className="font-medium text-text-primary">Aucune activité publiée pour le moment</p>
          <p className="mt-1 text-sm text-text-secondary">
            Revenez bientôt : les professionnels publient de nouvelles activités régulièrement.
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {typed.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  )
}

function MyActivitiesSection({
  activities,
  isLoading,
  onChanged,
}: {
  activities: Activity[]
  isLoading: boolean
  onChanged: () => void
}) {
  const [wizard, setWizard] = useState<{ editing: Activity | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setError(null)
    setSuccessMsg(null)
    try {
      await deleteActivity(id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Mes activités</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Complétez votre fiche en quelques étapes : informations, services, horaires, photos.
          </p>
        </div>
        <Button size="sm" onClick={() => setWizard({ editing: null })}>
          <Plus className="h-4 w-4" aria-hidden />
          Publier une activité
        </Button>
      </div>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
      {successMsg ? <Alert variant="success" className="mt-4">{successMsg}</Alert> : null}

      <div className="mt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Mes publications · {activities.length}
        </p>
        {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="font-medium text-text-primary">Aucune activité publiée</p>
              <p className="mt-1 text-sm text-text-secondary">
                Publiez votre première activité : elle apparaîtra dans le fil et la recherche.
              </p>
              <Button className="mt-4" size="sm" onClick={() => setWizard({ editing: null })}>
                <Plus className="h-4 w-4" aria-hidden />
                Publier une activité
              </Button>
            </Card>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-3 p-4 transition-colors hover:bg-background/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{activity.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{activity.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{activity.category}</Badge>
                      {activity.price ? <Badge>{activity.price}</Badge> : null}
                      {activity.photos.length > 0 ? (
                        <Badge variant="success">{activity.photos.length} photo(s)</Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWizard({ editing: activity })}
                      aria-label={`Modifier ${activity.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                      aria-label={`Supprimer ${activity.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {wizard ? (
        <ActivityWizard
          initial={wizard.editing ?? undefined}
          onClose={() => setWizard(null)}
          onSaved={() => {
            setWizard(null)
            setSuccessMsg(wizard.editing ? 'Activité mise à jour.' : 'Activité publiée !')
            onChanged()
          }}
        />
      ) : null}
    </div>
  )
}

function SolicitationsSection({
  received,
  sent,
  isLoading,
  onChanged,
}: {
  received: Solicitation[]
  sent: Solicitation[]
  isLoading: boolean
  onChanged: () => void
}) {
  const [error, setError] = useState<string | null>(null)

  const respond = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setError(null)
    try {
      await updateSolicitation(id, status)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  const name = (p?: { firstName: string; lastName: string }) =>
    p && (p.firstName || p.lastName) ? `${p.firstName} ${p.lastName}`.trim() : 'Utilisateur'

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-border-light" />
        <div className="h-32 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
      </div>
    )
  }

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Mes sollicitations</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Les demandes que vous avez envoyées et celles reçues des autres utilisateurs.
        </p>
      </div>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Reçues · {received.length}
          </p>
          {received.length === 0 ? (
            <Card className="p-6 text-center text-sm text-text-secondary">
              Aucune sollicitation reçue pour le moment.
            </Card>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
              {received.map((sol) => (
                <div key={sol.id} className="p-4 transition-colors hover:bg-background/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">De : {name(sol.from)}</p>
                    <Badge variant={statusLabels[sol.status].variant}>{statusLabels[sol.status].label}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{sol.message}</p>
                  {sol.status === 'PENDING' ? (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => respond(sol.id, 'ACCEPTED')}>
                        <Check className="h-4 w-4" aria-hidden />
                        Accepter
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => respond(sol.id, 'DECLINED')}>
                        <X className="h-4 w-4" aria-hidden />
                        Refuser
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Envoyées · {sent.length}
          </p>
          {sent.length === 0 ? (
            <Card className="p-6 text-center text-sm text-text-secondary">
              Vous n’avez encore envoyé aucune sollicitation.
            </Card>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
              {sent.map((sol) => (
                <div key={sol.id} className="p-4 transition-colors hover:bg-background/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">Vers : {name(sol.to)}</p>
                    <Badge variant={statusLabels[sol.status].variant}>{statusLabels[sol.status].label}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{sol.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsSection() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const nationalPhone = (value?: string) =>
    value?.startsWith('+237') ? value.slice(4).trim() : (value ?? '')

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState(nationalPhone(user?.phone))
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    setSaveError(null)
    try {
      await updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() ? `+237${phone.replace(/\D/g, '')}` : '',
      })
      await refreshUser()
      setSaveMsg('Profil mis à jour.')
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount(deletePassword)
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Paramètres</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Modifiez les informations de votre compte ou supprimez-le définitivement.
        </p>
      </div>

      <Card className="mt-6 max-w-lg p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            <UserRound className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <p className="text-base font-semibold text-text-primary">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <dt className="text-text-secondary">Type de compte</dt>
            <dd className="font-medium text-text-primary">{roleLabels[user?.role ?? 'CUSTOMER']}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <dt className="text-text-secondary">Email vérifié</dt>
            <dd>
              <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                {user?.isVerified ? 'Oui' : 'Non'}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary">Membre depuis</dt>
            <dd className="font-medium text-text-primary">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6 max-w-lg p-6">
        <h2 className="text-base font-semibold text-text-primary">Modifier mon profil</h2>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="me-firstname" className="mb-1 block text-sm font-medium text-text-primary">
                Prénom
              </label>
              <input
                id="me-firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                minLength={2}
                maxLength={60}
                className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="me-lastname" className="mb-1 block text-sm font-medium text-text-primary">
                Nom
              </label>
              <input
                id="me-lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                minLength={2}
                maxLength={60}
                className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="me-phone" className="mb-1 block text-sm font-medium text-text-primary">
              Téléphone
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute inset-y-0 left-0 flex select-none items-center border-r border-border bg-surface px-3 text-sm font-medium text-text-secondary"
                aria-hidden
              >
                +237
              </span>
              <input
                id="me-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6 90 00 00 00"
                className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background pl-[4.4rem] pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              />
            </div>
          </div>

          {saveMsg ? <Alert variant="success">{saveMsg}</Alert> : null}
          {saveError ? <Alert variant="error">{saveError}</Alert> : null}

          <Button type="submit" loading={saving}>
            Enregistrer
          </Button>
        </form>
      </Card>

      <Card className="mt-6 max-w-lg border-error/40 p-6">
        <h2 className="text-base font-semibold text-error">Supprimer mon compte</h2>
        <p className="mt-1 text-sm text-text-secondary">
          La suppression est définitive : vos activités et sollicitations seront supprimées
          avec votre compte.
        </p>

        {showDelete ? (
          <form onSubmit={handleDelete} className="mt-4 space-y-3">
            <div>
              <label htmlFor="delete-password" className="mb-1 block text-sm font-medium text-text-primary">
                Confirmez avec votre mot de passe
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-sm text-text-primary outline-none focus:border-error"
              />
            </div>
            {deleteError ? <Alert variant="error">{deleteError}</Alert> : null}
            <div className="flex gap-2">
              <Button type="submit" variant="danger" loading={deleting} disabled={!deletePassword}>
                Supprimer définitivement
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowDelete(false); setDeletePassword(''); setDeleteError(null) }}>
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="danger" className="mt-4" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer mon compte
          </Button>
        )}
      </Card>
    </div>
  )
}
