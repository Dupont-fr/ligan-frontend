import { apiPost } from '../lib/api'

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContact(payload: ContactPayload) {
  return apiPost<{ message: string }>('/api/contact', payload)
}
