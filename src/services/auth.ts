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

export type CodePurpose = 'verify' | 'reset'

export function register(input: RegisterInput): Promise<AuthUserResponse> {
  return apiPost<AuthUserResponse>('/api/auth/register', input)
}

export function verifyCode(email: string, code: string): Promise<AuthUserResponse> {
  return apiPost<AuthUserResponse>('/api/auth/verify-code', { email, code })
}

export function resendCode(email: string, purpose: CodePurpose): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/api/auth/resend-code', { email, purpose })
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

export function verifyResetCode(email: string, code: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/api/auth/verify-reset-code', { email, code })
}

export function resetPassword(email: string, code: string, password: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/api/auth/reset-password', { email, code, password })
}