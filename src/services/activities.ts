import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'

export type OpeningDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface ActivityService {
  name: string
  price?: string
}

export interface OpeningHour {
  day: OpeningDay
  open: string
  close: string
  closed: boolean
}

export interface ActivityContacts {
  phone?: string
  whatsapp?: string
  email?: string
}

export interface ActivityAddress {
  city?: string
  district?: string
  street?: string
}

export interface Activity {
  id: string
  title: string
  description: string
  category: string
  price?: string
  location?: string
  services: ActivityService[]
  contacts: ActivityContacts
  openingHours: OpeningHour[]
  address: ActivityAddress
  photos: string[]
  professional?: { id: string; firstName: string; lastName: string }
  createdAt: string
}

/** Corps complet envoyé par le wizard (création et modification). */
export interface ActivityInput {
  title: string
  description: string
  category: string
  price?: string
  location?: string
  services: ActivityService[]
  contacts: { phone: string; whatsapp?: string; email?: string }
  openingHours: OpeningHour[]
  address: { city: string; district?: string; street?: string }
  photos: string[]
}

export function listActivities(params?: { q?: string; category?: string }): Promise<{ activities: Activity[] }> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.category) query.set('category', params.category)
  const qs = query.toString()
  return apiGet<{ activities: Activity[] }>(`/api/activities${qs ? `?${qs}` : ''}`)
}

export function listMyActivities(): Promise<{ activities: Activity[] }> {
  return apiGet<{ activities: Activity[] }>('/api/activities/mine')
}

export function createActivity(input: ActivityInput): Promise<{ activity: Activity }> {
  return apiPost<{ activity: Activity }>('/api/activities', input)
}

export function updateActivity(id: string, input: ActivityInput): Promise<{ activity: Activity }> {
  return apiPatch<{ activity: Activity }>(`/api/activities/${id}`, input)
}

export function deleteActivity(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/activities/${id}`)
}
