import { API_URL, apiGet, apiPost } from '../lib/api'

export type BusinessEventType = 'PROFILE_VIEW' | 'PHONE_CLICK' | 'WHATSAPP_CLICK' | 'DIRECTION_CLICK'

export type StatsPeriod = 'today' | '7d' | '30d'

export interface TrackEventInput {
  activityId: string
  type: BusinessEventType
  sessionId?: string
}

export interface ActivityStats {
  id: string
  title: string
  status: string
  counts: Record<BusinessEventType, number>
  total: number
}

export interface AnalyticsStats {
  period: StatsPeriod
  since: string
  totals: Record<BusinessEventType, number>
  total: number
  byActivity: ActivityStats[]
}

export interface AdminActivityStat extends ActivityStats {
  professional: { firstName: string; lastName: string } | null
}

export interface PlatformOverview extends Omit<AnalyticsStats, 'byActivity'> {
  byActivity: AdminActivityStat[]
}

export function trackEvent(input: TrackEventInput): Promise<{ tracked: boolean }> {
  return apiPost<{ tracked: boolean }>('/api/analytics/events', input)
}

/** Identifiant de session visiteur (anonyme, stocké par onglet). */
export function visitorSessionId(): string | undefined {
  try {
    let sid = sessionStorage.getItem('ligan-sid')
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      sessionStorage.setItem('ligan-sid', sid)
    }
    return sid
  } catch {
    return undefined
  }
}

const VISITOR_ID_KEY = 'ligan-visitor-id'

/** Identifiant visiteur anonyme et persistant (random, jamais d'IP). */
export function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY)
    if (!id) {
      const uuid =
        typeof crypto !== 'undefined'
          ? (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.()
          : undefined
      id = uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
      localStorage.setItem(VISITOR_ID_KEY, id)
    }
    return id
  } catch {
    return undefined
  }
}

// Évite les doublons d'un même chemin (StrictMode monte les effets 2× en dev).
let lastTrackedPath: string | null = null

/** Enregistre une page vue (fire-and-forget, erreurs ignorées). */
export function trackVisit(path: string): void {
  if (path === lastTrackedPath) return
  lastTrackedPath = path

  const id = visitorId()
  if (!id) return

  void fetch(`${API_URL}/api/analytics/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId: id, path }),
    keepalive: true,
  }).catch(() => {})
}

export function getMyStats(period: StatsPeriod): Promise<AnalyticsStats> {
  return apiGet<AnalyticsStats>(`/api/analytics/stats?period=${period}`)
}

export function getPlatformOverview(period: StatsPeriod): Promise<PlatformOverview> {
  return apiGet<PlatformOverview>(`/api/analytics/overview?period=${period}`)
}

export type HistoryRange = '30d' | '90d' | '12mo'

/** Une entrée des courbes d'évolution (cumul à la fin du bucket). */
export interface HistoryPoint {
  date: string
  users: number
  activities: number
  activeSubs: number
  solicitations: number
  revenue: number
  /** Visiteurs uniques du bucket (non cumulé). */
  visitors: number
}

export interface PlatformHistory {
  range: HistoryRange
  granularity: 'day' | 'month'
  from: string
  /** Visiteurs uniques sur toute la période. */
  uniqueVisitors: number
  /** Pages vues sur toute la période. */
  pageViews: number
  points: HistoryPoint[]
}

/** Évolution cumulée (graphiques admin) — GET /api/analytics/history. */
export function getPlatformHistory(range: HistoryRange): Promise<PlatformHistory> {
  return apiGet<PlatformHistory>(`/api/analytics/history?range=${range}`)
}
