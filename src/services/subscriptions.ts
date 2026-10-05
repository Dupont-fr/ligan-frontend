import { apiGet, apiPost } from '../lib/api'
import type { PublicPlan } from './plans'

export type PaymentNetwork = 'mtn' | 'orange'
export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'EXPIRED'

export interface CurrentSubscription {
  id: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED'
  startDate: string
  endDate?: string
  daysLeft?: number
}

export interface PaymentRow {
  id: string
  planCode: string
  planName: string
  amount: number
  currency: string
  network: PaymentNetwork | null
  status: PaymentStatus
  failureReason: string | null
  createdAt: string
}

export interface SubscriptionState {
  plan: PublicPlan | null
  planCode: string
  subscription: CurrentSubscription | null
  payments: PaymentRow[]
  /** true = clés SebPay absentes, paiements simulés (mode démo). */
  mock: boolean
}

export interface StartedPayment {
  id: string
  planCode: string
  planName: string
  amount: number
  currency: string
  status: PaymentStatus
  providerRef: string | null
  network: PaymentNetwork | null
  failureReason: string | null
  createdAt: string
}

export interface CheckoutInput {
  planId: string
  phoneNumber: string
  network: PaymentNetwork
}

export function getMySubscription(): Promise<SubscriptionState> {
  return apiGet<SubscriptionState>('/api/subscriptions/me')
}

export interface CheckoutResult {
  payment: StartedPayment
  /** Lien de validation SebPay (page d'approbation) — à ouvrir si présent. */
  providerLink?: string | null
  mock: boolean
}

export function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  return apiPost<CheckoutResult>('/api/subscriptions/checkout', input)
}

export function getPaymentStatus(id: string): Promise<{ payment: StartedPayment }> {
  return apiGet<{ payment: StartedPayment }>(`/api/subscriptions/payments/${id}`)
}

export function downgradeToFree(): Promise<{
  plan: PublicPlan | null
  planCode: string
  subscription: CurrentSubscription | null
}> {
  return apiPost('/api/subscriptions/downgrade')
}
