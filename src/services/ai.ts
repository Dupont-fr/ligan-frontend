import { apiPost } from '../lib/api'

export interface AIGenerateActivityDraft {
  titre: string
  description: string
  services?: string[]
  tags?: string[]
}

export async function generateActivityDraft(prompt: string) {
  const res = await apiPost<{ draft: AIGenerateActivityDraft }>('/api/ai/generate-activity', { prompt })
  return res.draft
}
