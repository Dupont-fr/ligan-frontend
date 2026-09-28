import {
  Car,
  ChefHat,
  GraduationCap,
  Hammer,
  HeartPulse,
  Laptop,
  Scissors,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface UiCategory {
  slug: string
  label: string
  icon: LucideIcon
}

/* Registre d'icônes par slug — toute catégorie créée par l'admin
   sans icône dédiée tombe sur Wrench. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  batiment: Hammer,
  plomberie: Wrench,
  electricite: Zap,
  mecanique: Car,
  beaute: Scissors,
  menage: Sparkles,
  informatique: Laptop,
  cours: GraduationCap,
  cuisine: ChefHat,
  bienetre: HeartPulse,
}

/* Liste utilisée si l'API catégories est indisponible (repli hors-ligne). */
export const FALLBACK_CATEGORIES: UiCategory[] = [
  { slug: 'batiment', label: 'Bâtiment & Rénovation', icon: Hammer },
  { slug: 'plomberie', label: 'Plomberie', icon: Wrench },
  { slug: 'electricite', label: 'Électricité', icon: Zap },
  { slug: 'mecanique', label: 'Mécanique', icon: Car },
  { slug: 'beaute', label: 'Coiffure & Beauté', icon: Scissors },
  { slug: 'menage', label: 'Ménage & Nettoyage', icon: Sparkles },
  { slug: 'informatique', label: 'Informatique & Tech', icon: Laptop },
  { slug: 'cours', label: 'Cours particuliers', icon: GraduationCap },
  { slug: 'cuisine', label: 'Cuisine & Traiteur', icon: ChefHat },
  { slug: 'bienetre', label: 'Santé & Bien-être', icon: HeartPulse },
]

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}
