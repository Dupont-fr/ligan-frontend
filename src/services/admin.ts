import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'
import type { UserRole } from './auth'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  isVerified: boolean
  suspended: boolean
  suspendedAt?: string
  suspendedReason?: string
  createdAt: string
}

export interface AdminUserInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role: UserRole
}

export interface AdminUserUpdate {
  firstName?: string
  lastName?: string
  phone?: string
  role?: UserRole
  isVerified?: boolean
}

export interface AdminStats {
  users: { total: number; customers: number; professionals: number; admins: number; suspended: number }
  activities: {
    total: number
    approved: number
    pending: number
    rejected: number
    suspended: number
  }
  categories: { total: number; active: number }
  solicitations: { total: number; pending: number; accepted: number; declined: number }
  reviews: { total: number; pending: number; approved: number; rejected: number }
}

export type ActivityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface AdminActivity {
  id: string
  slug?: string
  title: string
  category: string
  status: ActivityStatus
  moderationReason?: string
  photos: string[]
  createdAt: string
  professional: { id: string; firstName: string; lastName: string; email?: string }
}

export interface AdminActivitiesPage {
  activities: AdminActivity[]
  total: number
  page: number
  pages: number
}

export function listUsers(): Promise<{ users: AdminUser[] }> {
  return apiGet<{ users: AdminUser[] }>('/api/admin/users')
}

export function createUser(input: AdminUserInput): Promise<{ user: AdminUser }> {
  return apiPost<{ user: AdminUser }>('/api/admin/users', input)
}

export function updateUser(id: string, input: AdminUserUpdate): Promise<{ user: AdminUser }> {
  return apiPatch<{ user: AdminUser }>(`/api/admin/users/${id}`, input)
}

export function removeUser(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/admin/users/${id}`)
}

export function getStats(): Promise<{ stats: AdminStats }> {
  return apiGet<{ stats: AdminStats }>('/api/admin/stats')
}

export function suspendUser(
  id: string,
  input: { suspended: boolean; reason?: string },
): Promise<{ user: AdminUser }> {
  return apiPatch<{ user: AdminUser }>(`/api/admin/users/${id}/suspend`, input)
}

export function listAdminActivities(params: {
  status?: ActivityStatus
  q?: string
  page?: number
  limit?: number
}): Promise<AdminActivitiesPage> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.q) query.set('q', params.q)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiGet<AdminActivitiesPage>(`/api/admin/activities${qs ? `?${qs}` : ''}`)
}

export function setActivityStatus(
  id: string,
  input: { status: Exclude<ActivityStatus, 'PENDING'>; reason?: string },
): Promise<{ activity: AdminActivity }> {
  return apiPatch<{ activity: AdminActivity }>(`/api/admin/activities/${id}/status`, input)
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AdminReview {
  id: string
  rating: number
  comment: string
  status: ReviewStatus
  moderationReason?: string
  createdAt: string
  reviewer: { id: string; firstName: string; lastName: string; email?: string }
  activity?: { id: string; title: string; slug?: string }
}

export interface AdminReviewsPage {
  reviews: AdminReview[]
  total: number
  page: number
  pages: number
}

export function listAdminReviews(params: {
  status?: ReviewStatus
  q?: string
  page?: number
  limit?: number
}): Promise<AdminReviewsPage> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.q) query.set('q', params.q)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiGet<AdminReviewsPage>(`/api/admin/reviews${qs ? `?${qs}` : ''}`)
}

export function setReviewStatus(
  id: string,
  input: { status: 'APPROVED' | 'REJECTED'; reason?: string },
): Promise<{ review: { id: string; status: ReviewStatus } }> {
  return apiPatch<{ review: { id: string; status: ReviewStatus } }>(
    `/api/admin/reviews/${id}/status`,
    input,
  )
}
