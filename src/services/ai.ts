import { apiPost } from '../lib/api'

export interface AIGenerateActivityDraft {
  titre: string
  description: string
  services?: string[]
  tags?: string[]
}

export async function generateActivityDraft(prompt: string) {
  const res = await apiPost<{ draft: AIGenerateActivityDraft; freeAiLimit?: { used: number; max: number; remaining: number }; warning?: string }>('/api/ai/generate-activity', { prompt })
  return res
}
