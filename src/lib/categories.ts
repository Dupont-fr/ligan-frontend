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

export interface Category {
  slug: string
  label: string
  icon: LucideIcon
}

export const CATEGORIES: Category[] = [
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
