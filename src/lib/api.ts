export const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status}`)
  }

  const json = (await res.json()) as ApiEnvelope<T>
  if (!json.success) {
    throw new Error('Réponse API invalide')
  }
  return json.data
}