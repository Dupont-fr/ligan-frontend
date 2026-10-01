import { Star } from 'lucide-react'

interface StarRatingProps {
  /** Note à afficher (1-5, décimale acceptée pour la moyenne). */
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
  /** Rendu sur le conteneur du sélecteur (rattachement <label for>). */
  id?: string
}

const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5' } as const

/**
 * Affiche 5 étoiles (lecture seule) ou un sélecteur 1-5 si `onChange` est fourni.
 * Étoiles pleines en `text-warning` (or), vides en `text-border`.
 */
export function StarRating({ value, onChange, size = 'md', className = '', ariaLabel, id }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  if (onChange) {
    return (
      <div id={id} className={`inline-flex items-center gap-0.5 ${className}`} role="radiogroup" aria-label={ariaLabel ?? 'Note'}>
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} sur 5`}
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Star
              className={`${SIZES[size]} ${star <= value ? 'fill-current text-warning' : 'text-border'}`}
              aria-hidden
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center ${className}`} aria-label={ariaLabel ?? `Note : ${value} sur 5`}>
      {stars.map((star) => (
        <Star
          key={star}
          className={`${SIZES[size]} ${star <= Math.round(value) ? 'fill-current text-warning' : 'text-border'}`}
          aria-hidden
        />
      ))}
    </span>
  )
}
