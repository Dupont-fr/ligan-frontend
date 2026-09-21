import { apiGet, apiPost } from '../lib/api'

export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUserResponse {
  user: User
}

export interface MessageResponse {
  message: string
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
}

export function register(input: RegisterInput): Promise<AuthUserResponse> {
  return apiPost<AuthUserResponse>('/api/auth/register', input)
}

export function verifyEmail(token: string): Promise<AuthUserResponse> {
  return apiGet<AuthUserResponse>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export function login(email: string, password: string): Promise<AuthUserResponse> {
  return apiPost<AuthUserResponse>('/api/auth/login', { email, password })
}

export function logout(): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/api/auth/logout')
}

export function refreshUser(): Promise<AuthUserResponse> {
  return apiPost<AuthUserResponse>('/api/auth/refresh')
}

export function me(): Promise<AuthUserResponse> {
  return apiGet<AuthUserResponse>('/api/auth/me')
}

export function forgotPassword(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/api/auth/forgot-password', { email })
}

export function resetPassword(token: string, password: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/api/auth/reset-password', { token, password })
}