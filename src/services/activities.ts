import { apiDelete, apiGet, apiPost } from '../lib/api'

export interface Activity {
  id: string
  title: string
  description: string
  category: string
  price?: string
  location?: string
  professional?: { id: string; firstName: string; lastName: string }
  createdAt: string
}

export interface CreateActivityInput {
  title: string
  description: string
  category: string
  price?: string
  location?: string
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

export function createActivity(input: CreateActivityInput): Promise<{ activity: Activity }> {
  return apiPost<{ activity: Activity }>('/api/activities', input)
}

export function deleteActivity(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/activities/${id}`)
}
