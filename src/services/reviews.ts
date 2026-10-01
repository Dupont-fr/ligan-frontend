import { apiDelete, apiPost } from '../lib/api'

export interface ReviewInput {
  activityId: string
  rating: number
  comment: string
}

export interface PublicReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewer?: { id?: string; firstName: string; lastName: string }
}

export interface CreatedReview extends PublicReview {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export function createReview(input: ReviewInput): Promise<{ review: CreatedReview }> {
  return apiPost<{ review: CreatedReview }>('/api/reviews', input)
}

export function deleteReview(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/reviews/${id}`)
}
