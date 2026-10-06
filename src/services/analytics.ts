import { apiGet, apiPost } from '../lib/api'

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
}

export interface PlatformHistory {
  range: HistoryRange
  granularity: 'day' | 'month'
  from: string
  points: HistoryPoint[]
}

/** Évolution cumulée (graphiques admin) — GET /api/analytics/history. */
export function getPlatformHistory(range: HistoryRange): Promise<PlatformHistory> {
  return apiGet<PlatformHistory>(`/api/analytics/history?range=${range}`)
}
