import { apiGet } from '../lib/api'

export interface PublicPlan {
  id: string
  code: 'FREE' | 'PRO' | 'PREMIUM'
  name: string
  price: number
  durationDays: number
  features: string[]
  highlight: boolean
  order: number
}

export function listPlans(): Promise<{ plans: PublicPlan[] }> {
  return apiGet<{ plans: PublicPlan[] }>('/api/plans')
}
