import { apiGet, apiPost } from '../lib/api'
import type { UserRole } from './auth'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  isVerified: boolean
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

export function listUsers(): Promise<{ users: AdminUser[] }> {
  return apiGet<{ users: AdminUser[] }>('/api/admin/users')
}

export function createUser(input: AdminUserInput): Promise<{ user: AdminUser }> {
  return apiPost<{ user: AdminUser }>('/api/admin/users', input)
}
