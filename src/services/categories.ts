import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  order: number
  active: boolean
}

export interface CategoryInput {
  name?: string
  slug?: string
  parentId?: string | null
  order?: number
  active?: boolean
}

export function listCategories(): Promise<{ categories: Category[] }> {
  return apiGet<{ categories: Category[] }>('/api/categories')
}

export function listAllCategories(): Promise<{ categories: Category[] }> {
  return apiGet<{ categories: Category[] }>('/api/categories?all=1')
}

export function createCategory(input: CategoryInput): Promise<{ category: Category }> {
  return apiPost<{ category: Category }>('/api/categories', input)
}

export function updateCategory(id: string, input: CategoryInput): Promise<{ category: Category }> {
  return apiPatch<{ category: Category }>(`/api/categories/${id}`, input)
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/categories/${id}`)
}
