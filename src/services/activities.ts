import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'
import type { PublicReview } from './reviews'

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
  slug?: string
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
  latitude?: number
  longitude?: number
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  moderationReason?: string
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
  latitude?: number
  longitude?: number
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

export interface BusinessProfessional {
  id: string
  firstName: string
  lastName: string
  isVerified: boolean
  memberSince: string | null
}

export interface BusinessRating {
  average: number
  count: number
}

/** Fiche publique /business/:slug (Sprint 4) — note moyenne + avis publics (Sprint 11). */
export function getBusiness(
  slug: string,
): Promise<{
  activity: Activity
  professional: BusinessProfessional
  rating: BusinessRating
  reviews: PublicReview[]
}> {
  return apiGet<{
    activity: Activity
    professional: BusinessProfessional
    rating: BusinessRating
    reviews: PublicReview[]
  }>(`/api/businesses/${encodeURIComponent(slug)}`)
}

/** Recherche géolocalisée + filtres/tri — /api/businesses/search (Sprints 5–6). */
export type BusinessSort = 'recent' | 'distance' | 'name'

export interface BusinessSearchParams {
  q?: string
  category?: string
  city?: string
  latitude?: number
  longitude?: number
  radius?: number
  sort?: BusinessSort
  openNow?: boolean
  hasPhotos?: boolean
  verified?: boolean
  limit?: number
  page?: number
}

export interface BusinessSearchItem extends Activity {
  distance?: number
}

export interface BusinessSearchResult {
  items: BusinessSearchItem[]
  count: number
  total: number
  page: number
  pages: number
  geo: boolean
  sort: BusinessSort
}

export function searchBusinesses(params: BusinessSearchParams = {}): Promise<BusinessSearchResult> {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category) query.set('category', params.category)
  if (params.city) query.set('city', params.city)
  if (typeof params.latitude === 'number') query.set('latitude', String(params.latitude))
  if (typeof params.longitude === 'number') query.set('longitude', String(params.longitude))
  if (typeof params.radius === 'number') query.set('radius', String(params.radius))
  if (params.sort) query.set('sort', params.sort)
  if (params.openNow !== undefined) query.set('openNow', String(params.openNow))
  if (params.hasPhotos !== undefined) query.set('hasPhotos', String(params.hasPhotos))
  if (params.verified !== undefined) query.set('verified', String(params.verified))
  if (typeof params.limit === 'number') query.set('limit', String(params.limit))
  if (typeof params.page === 'number') query.set('page', String(params.page))
  const qs = query.toString()
  return apiGet<BusinessSearchResult>(`/api/businesses/search${qs ? `?${qs}` : ''}`)
}
