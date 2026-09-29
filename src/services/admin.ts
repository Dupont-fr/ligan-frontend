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
  users: { total: number; customers: number; professionals: number; admins: number }
  activities: { total: number }
  categories: { total: number; active: number }
  solicitations: { total: number; pending: number; accepted: number; declined: number }
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
