import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity as ActivityIcon,
  Check,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityCard } from '../../components/activities/ActivityCard'
import { Logo } from '../../components/layout/Logo'
import { ThemeToggle } from '../../components/shared/ThemeToggle'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../features/auth/AuthContext'
import { ApiError } from '../../lib/api'
import { CATEGORIES } from '../../lib/categories'
import {
  createActivity,
  deleteActivity,
  listActivities,
  listMyActivities,
} from '../../services/activities'
import {
  listMySolicitations,
  updateSolicitation,
} from '../../services/solicitations'
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Logo />
        </div>
        <nav className="p-3" aria-label="Navigation du tableau de bord">
          <ul className="space-y-1">
            {visibleNav.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors ${
                    section === item.id
                      ? 'bg-primary-light font-medium text-primary'
                      : 'text-text-secondary hover:bg-background hover:text-text-primary'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              Bonjour, {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-text-muted">Espace {roleLabels[user?.role ?? 'CUSTOMER']}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:hidden" aria-label="Sections">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium ${
                section === item.id ? 'bg-primary text-primary-contrast' : 'text-text-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 px-4 py-8 md:px-8">
          {section === 'feed' ? (
            <FeedSection
              activities={feedQuery.data?.activities ?? []}
              isLoading={feedQuery.isLoading}
              currentUserId={user?.id}
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
        </main>
      </div>
    </div>
  )
}

function FeedSection({
  activities,
  isLoading,
  currentUserId,
  onManage,
}: {
  activities: { id: string }[] & Parameters<typeof ActivityCard>[0]['activity'][]
  isLoading: boolean
  currentUserId?: string
  onManage: () => void
}) {
  const typed = activities as Parameters<typeof ActivityCard>[0]['activity'][]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fil d’activité</h1>
          <p className="text-sm text-text-secondary">
            Les dernières activités publiées par les professionnels — sollicitez-les en 1 clic.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onManage}>
          Gérer mes activités
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
          ))}
        </div>
      ) : typed.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <p className="font-medium text-text-primary">Aucune activité pour le moment</p>
          <p className="mt-1 text-sm text-text-secondary">
            Soyez le premier à publier une activité ou revenez bientôt.
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
  activities: Parameters<typeof ActivityCard>[0]['activity'][]
  isLoading: boolean
  onChanged: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].label)
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setSubmitting(true)
    try {
      await createActivity({ title, description, category, price: price || undefined, location: location || undefined })
      setSuccessMsg('Activité publiée !')
      setTitle('')
      setDescription('')
      setPrice('')
      setLocation('')
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mes activités</h1>
        <p className="text-sm text-text-secondary">
          Publiez vos services : ils apparaîtront dans le fil de tous les utilisateurs.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Plus className="h-4 w-4 text-primary" aria-hidden />
            Publier une activité
          </p>
          {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
          {successMsg ? <Alert variant="success" className="mb-4">{successMsg}</Alert> : null}
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="act-title" className="mb-1 block text-sm font-medium text-text-primary">
                Titre
              </label>
              <input
                id="act-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={120}
                placeholder="Ex : Réparation de fuite d’eau"
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="act-desc" className="mb-1 block text-sm font-medium text-text-primary">
                Description
              </label>
              <textarea
                id="act-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="Décrivez votre service, votre expérience, votre zone d’intervention…"
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="act-cat" className="mb-1 block text-sm font-medium text-text-primary">
                Catégorie
              </label>
              <select
                id="act-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="act-price" className="mb-1 block text-sm font-medium text-text-primary">
                  Tarif (optionnel)
                </label>
                <input
                  id="act-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  maxLength={60}
                  placeholder="Ex : 5 000 FCFA / intervention"
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="act-loc" className="mb-1 block text-sm font-medium text-text-primary">
                  Zone (optionnel)
                </label>
                <input
                  id="act-loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={120}
                  placeholder="Ex : Douala, Akwa"
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                />
              </div>
            </div>
            <Button type="submit" loading={submitting} className="w-full">
              Publier
            </Button>
          </form>
        </Card>

        <div>
          <p className="mb-3 text-sm font-semibold text-text-primary">
            Mes publications ({activities.length})
          </p>
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <Card className="p-6 text-center text-sm text-text-secondary">
              Vous n’avez encore publié aucune activité.
            </Card>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{activity.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{activity.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{activity.category}</Badge>
                      {activity.price ? <Badge>{activity.price}</Badge> : null}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(activity.id)}
                    aria-label={`Supprimer ${activity.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
        <h1 className="text-2xl font-bold text-text-primary">Mes sollicitations</h1>
        <p className="text-sm text-text-secondary">
          Les demandes que vous avez envoyées et celles reçues de autres utilisateurs.
        </p>
      </div>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold text-text-primary">Reçues ({received.length})</p>
          {received.length === 0 ? (
            <Card className="p-6 text-center text-sm text-text-secondary">
              Aucune sollicitation reçue pour le moment.
            </Card>
          ) : (
            <ul className="space-y-3">
              {received.map((sol) => (
                <li key={sol.id} className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
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
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-text-primary">Envoyées ({sent.length})</p>
          {sent.length === 0 ? (
            <Card className="p-6 text-center text-sm text-text-secondary">
              Vous n’avez encore envoyé aucune sollicitation.
            </Card>
          ) : (
            <ul className="space-y-3">
              {sent.map((sol) => (
                <li key={sol.id} className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">Vers : {name(sol.to)}</p>
                    <Badge variant={statusLabels[sol.status].variant}>{statusLabels[sol.status].label}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{sol.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsSection() {
  const { user } = useAuth()

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Paramètres</h1>
        <p className="text-sm text-text-secondary">Les informations de votre compte.</p>
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
          {user?.phone ? (
            <div className="flex items-center justify-between border-b border-border pb-3">
              <dt className="text-text-secondary">Téléphone</dt>
              <dd className="font-medium text-text-primary">{user.phone}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary">Membre depuis</dt>
            <dd className="font-medium text-text-primary">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
