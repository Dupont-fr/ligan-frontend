import {
  CakeSlice,
  Calculator,
  Camera,
  Car,
  ChefHat,
  Droplets,
  Flame,
  Frame,
  GraduationCap,
  Hammer,
  HardHat,
  HeartPulse,
  House,
  Languages,
  Laptop,
  Leaf,
  PaintRoller,
  Printer,
  Ruler,
  Scissors,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  Sun,
  Tractor,
  Truck,
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
  menuiserie: Ruler,
  maconnerie: HardHat,
  peinture: PaintRoller,
  soudure: Flame,
  'froid-climatisation': Snowflake,
  jardinage: Leaf,
  transport: Truck,
  couture: Scissors,
  photographie: Camera,
  securite: ShieldCheck,
  'lavage-auto': Droplets,
  patisserie: CakeSlice,
  vitrerie: Frame,
  'panneaux-solaires': Sun,
  toiture: House,
  'reparation-electronique': Smartphone,
  imprimerie: Printer,
  'comptabilite-juridique': Calculator,
  traduction: Languages,
  'elevage-agriculture': Tractor,
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
  { slug: 'menuiserie', label: 'Menuiserie (bois & alu)', icon: Ruler },
  { slug: 'maconnerie', label: 'Maçonnerie & Carrelage', icon: HardHat },
  { slug: 'peinture', label: 'Peinture & Décoration', icon: PaintRoller },
  { slug: 'soudure', label: 'Soudure & Métallurgie', icon: Flame },
  { slug: 'froid-climatisation', label: 'Froid & Climatisation', icon: Snowflake },
  { slug: 'jardinage', label: 'Jardinage & Espaces verts', icon: Leaf },
  { slug: 'transport', label: 'Transport & Déménagement', icon: Truck },
  { slug: 'couture', label: 'Couture & Modiste', icon: Scissors },
  { slug: 'photographie', label: 'Photographie & Événementiel', icon: Camera },
  { slug: 'securite', label: 'Sécurité & Gardiennage', icon: ShieldCheck },
  { slug: 'lavage-auto', label: 'Lavage & Entretien auto', icon: Droplets },
  { slug: 'patisserie', label: 'Pâtisserie & Boulangerie', icon: CakeSlice },
  { slug: 'vitrerie', label: 'Vitrerie & Miroiterie', icon: Frame },
  { slug: 'panneaux-solaires', label: 'Panneaux solaires & Forage', icon: Sun },
  { slug: 'toiture', label: 'Toiture & Étanchéité', icon: House },
  { slug: 'reparation-electronique', label: 'Réparation téléphone & Électronique', icon: Smartphone },
  { slug: 'imprimerie', label: 'Imprimerie & Signalétique', icon: Printer },
  { slug: 'comptabilite-juridique', label: 'Comptabilité & Juridique', icon: Calculator },
  { slug: 'traduction', label: 'Traduction & Rédaction', icon: Languages },
  { slug: 'elevage-agriculture', label: 'Élevage & Agriculture', icon: Tractor },
]

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}
