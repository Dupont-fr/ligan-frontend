import { apiGet, apiPatch, apiPost } from '../lib/api'

export type SolicitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface Solicitation {
  id: string
  message: string
  status: SolicitationStatus
  from?: { id: string; firstName: string; lastName: string }
  to?: { id: string; firstName: string; lastName: string }
  createdAt: string
}

export interface CreateSolicitationInput {
  toProfessionalId: string
  activityId?: string
  message: string
}

export function createSolicitation(
  input: CreateSolicitationInput,
): Promise<{ solicitation: Solicitation }> {
  return apiPost<{ solicitation: Solicitation }>('/api/solicitations', input)
}

export function listMySolicitations(): Promise<{ received: Solicitation[]; sent: Solicitation[] }> {
  return apiGet<{ received: Solicitation[]; sent: Solicitation[] }>('/api/solicitations')
}

export function updateSolicitation(
  id: string,
  status: 'ACCEPTED' | 'DECLINED',
): Promise<{ solicitation: Solicitation }> {
  return apiPatch<{ solicitation: Solicitation }>(`/api/solicitations/${id}`, { status })
}
