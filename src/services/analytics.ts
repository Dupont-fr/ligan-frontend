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
