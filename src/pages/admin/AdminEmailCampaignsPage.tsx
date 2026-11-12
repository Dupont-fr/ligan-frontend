import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Send, Sparkles, Users, AlertCircle, CheckCircle, History } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import {
  bulkSendEmailCampaign,
  generateEmailCampaignAI,
  listEmailCampaigns,
  listUsers,
  type AdminEmailCampaign,
} from '../../services/admin'

function formatCampaignDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function campaignStatusVariant(campaign: AdminEmailCampaign): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  if (campaign.status === 'SENT') return campaign.failedCount > 0 ? 'warning' : 'success'
  if (campaign.status === 'FAILED') return 'error'
  if (campaign.status === 'SENDING') return 'info'
  return 'neutral'
}

export function AdminEmailCampaignsPage() {
  const queryClient = useQueryClient()
  const [concept, setConcept] = useState('')
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [body, setBody] = useState('')
  const [recipientType, setRecipientType] = useState<'ALL' | 'BY_ROLE' | 'MANUAL'>('ALL')
  const [recipientRoles, setRecipientRoles] = useState<('CUSTOMER' | 'PROFESSIONAL' | 'ADMIN')[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [testEmail, setTestEmail] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [notice, setNotice] = useState<{ variant: 'success' | 'warning' | 'error'; message: string } | null>(
    null,
  )

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users', 'emails'],
    queryFn: listUsers,
  })

  const { data: historyData } = useQuery({
    queryKey: ['admin', 'email-campaigns'],
    queryFn: () => listEmailCampaigns({ limit: 20 }),
  })
  const campaigns = historyData?.campaigns ?? []

  const users = usersData?.users.filter((u) => !u.suspended) || []
  const totalRecipients =
    recipientType === 'ALL'
      ? users.length
      : recipientType === 'BY_ROLE'
        ? users.filter((u) => recipientRoles.includes(u.role)).length
        : selectedUserIds.length

  const generateMutation = useMutation({
    mutationFn: generateEmailCampaignAI,
    onSuccess: (data) => {
      setSubject(data.email.subject || '')
      setPreheader(data.email.preheader || '')
      setBody(data.email.body || '')
    },
  })

  const testMutation = useMutation({
    mutationFn: (email: string) =>
      bulkSendEmailCampaign({
        subject,
        preheader,
        body,
        recipientType: 'ALL',
        testEmail: email,
        sendTestOnly: true,
      }),
  })

  const sendMutation = useMutation({
    mutationFn: () =>
      bulkSendEmailCampaign({
        subject,
        preheader,
        body,
        recipientType,
        recipientRoles: recipientType === 'BY_ROLE' ? recipientRoles : undefined,
        recipientUserIds: recipientType === 'MANUAL' ? selectedUserIds : undefined,
        confirmBulk: true,
      }),
    onSuccess: (data) => {
      setShowConfirm(false)
      const sent = data.sentCount ?? 0
      const failed = data.failedCount ?? 0
      const total = data.totalCount ?? 0
      setNotice({
        variant: failed > 0 ? 'warning' : 'success',
        message:
          failed > 0
            ? `Email envoyé à ${sent} utilisateur(s) sur ${total} (${failed} échec(s)).`
            : `Email envoyé à ${sent} utilisateur(s).`,
      })
      // Réinitialise le formulaire après l'envoi
      setConcept('')
      setSubject('')
      setPreheader('')
      setBody('')
      setTestEmail('')
      setRecipientRoles([])
      setSelectedUserIds([])
      setRecipientType('ALL')
      queryClient.invalidateQueries({ queryKey: ['admin', 'email-campaigns'] })
    },
    onError: () => {
      setShowConfirm(false)
      setNotice({ variant: 'error', message: "Échec de l'envoi de la campagne. Veuillez réessayer." })
    },
  })

  const toggleRole = (role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN') => {
    setRecipientRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Campagnes email</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Créer, générer avec l'IA et envoyer des emails à vos utilisateurs
          </p>
        </div>
      </div>

      {notice && (
        <div className="mt-4">
          <Alert variant={notice.variant}>
            <span className="flex w-full items-center justify-between gap-3">
              <span>{notice.message}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="shrink-0 text-xs font-medium underline opacity-70 hover:opacity-100"
              >
                Fermer
              </button>
            </span>
          </Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-text-primary">Génération IA</h2>
            </div>
            <p className="mt-1 text-xs text-text-muted">Décrivez votre campagne et laissez l'IA rédiger l'email</p>
            <textarea
              className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-text-primary"
              rows={4}
              placeholder="Ex: Annoncer une nouvelle promotion pour les professionnels..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
            />
            <button
              onClick={() => generateMutation.mutate(concept)}
              disabled={!concept.trim() || generateMutation.isPending}
              className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {generateMutation.isPending ? 'Génération...' : 'Générer avec l\'IA'}
            </button>
          </section>

          <section className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-text-primary">Contenu de l'email</h2>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary">Objet</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-text-primary"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet de l'email"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary">Pré-titre (préheader)</label>
                <input
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-text-primary"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Texte affiché dans l'aperçu"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary">Corps du message</label>
                <textarea
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-text-primary"
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Rédigez votre message... Utilisez {`{{firstName}}`} pour la personnalisation"
                />
                <p className="mt-1 text-xs text-text-muted">Astuce: utilisez {`{{firstName}}`} pour personnaliser avec le prénom</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-text-primary">Destinataires</h2>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { value: 'ALL', label: 'Tous les utilisateurs', count: users.length },
                { value: 'BY_ROLE', label: 'Par rôle', count: recipientRoles.length ? users.filter((u) => recipientRoles.includes(u.role)).length : 0 },
                { value: 'MANUAL', label: 'Sélection manuelle', count: selectedUserIds.length },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-text-primary">
                  <input
                    type="radio"
                    checked={recipientType === opt.value}
                    onChange={() => setRecipientType(opt.value as any)}
                  />
                  {opt.label}
                  <span className="ml-auto text-xs text-text-muted">({opt.count} non-suspendu(s))</span>
                </label>
              ))}
            </div>

            {recipientType === 'BY_ROLE' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(['CUSTOMER', 'PROFESSIONAL', 'ADMIN'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      recipientRoles.includes(role)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-text-secondary border border-border'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}

            {recipientType === 'MANUAL' && (
              <div className="mt-3 max-h-48 overflow-auto rounded border border-border">
                {users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background/60">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <span className="flex-1 text-text-primary">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-text-muted">{u.role}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-3 rounded bg-background/60 p-2 text-xs text-text-secondary">
              Total destinataires (non-suspendus): <strong>{totalRecipients}</strong>
            </div>
          </section>

          <section className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text-primary">Test et envoi</h2>
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-text-primary"
                  placeholder="email@test.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <button
                  onClick={() => testEmail && testMutation.mutate(testEmail)}
                  disabled={!testEmail || !subject || !body || testMutation.isPending}
                  className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm disabled:opacity-50"
                >
                  {testMutation.isPending ? 'Envoi...' : 'Envoyer un test'}
                </button>
              </div>
              {testMutation.isSuccess && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle className="h-3 w-3" /> Test envoyé
                </p>
              )}
              {testMutation.isError && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" /> Échec de l'envoi
                </p>
              )}
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!subject || !body || totalRecipients === 0 || sendMutation.isPending}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Envoyer à {totalRecipients} destinataire(s)
            </button>
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-text-primary">Historique des campagnes</h2>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Les {campaigns.length} dernière(s) campagne(s) envoyée(s)
        </p>

        {campaigns.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">Aucune campagne envoyée pour le moment.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="pb-2 pr-3 font-medium">Objet</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Statut</th>
                  <th className="pb-2 pr-3 font-medium">Envoyés</th>
                  <th className="pb-2 pr-3 font-medium">Échecs</th>
                  <th className="pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-medium text-text-primary">{c.subject}</span>
                      {c.createdBy && (
                        <span className="block text-xs text-text-muted">
                          par {c.createdBy.firstName} {c.createdBy.lastName}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-text-secondary">
                      {formatCampaignDate(c.sentAt ?? c.createdAt)}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant={campaignStatusVariant(c)}>{c.status}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-text-primary">{c.sentCount}</td>
                    <td className="py-2 pr-3 text-text-primary">{c.failedCount}</td>
                    <td className="py-2 text-text-primary">{c.totalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <h3 className="text-lg font-semibold text-text-primary">Confirmer l'envoi</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Vous êtes sur le point d'envoyer cet email à <strong>{totalRecipients}</strong> utilisateur(s) non suspendu(s). Cette action est irréversible.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending}
                className="flex-1 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {sendMutation.isPending ? 'Envoi...' : 'Confirmer et envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


