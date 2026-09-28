import { useQuery } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { CATEGORY_ICONS, FALLBACK_CATEGORIES, type UiCategory } from '../lib/categories'
import { listCategories } from '../services/categories'

/* Liste des catégories actives (API) avec repli sur la liste locale.
   Mêmes labels des deux côtés : aucun flash à l'affichage. */
export function useCategories(): UiCategory[] {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  if (!data) return FALLBACK_CATEGORIES

  return data.categories.map((cat) => ({
    slug: cat.slug,
    label: cat.name,
    icon: CATEGORY_ICONS[cat.slug] ?? Wrench,
  }))
}
