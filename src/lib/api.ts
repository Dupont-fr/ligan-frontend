export const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string>

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function parseEnvelope<T>(body: string): ApiEnvelope<T> | null {
  if (!body) return null
  try {
    return JSON.parse(body) as ApiEnvelope<T>
  } catch {
    return null
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
    credentials: 'include',
  })

  const json: ApiEnvelope<T> | null = parseEnvelope<T>(await res.text())

  if (!res.ok || (json && !json.success)) {
    throw new ApiError(json?.message ?? `Erreur HTTP ${res.status}`, res.status, json?.errors)
  }

  if (!json) {
    throw new ApiError('Réponse API invalide', res.status)
  }

  return json.data
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}