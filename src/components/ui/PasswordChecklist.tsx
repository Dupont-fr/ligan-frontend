import { Check, X } from 'lucide-react'

const PASSWORD_RULES = [
  {
    label: 'Au moins 8 caractères',
    test: (p: string) => p.length >= 8,
  },
  {
    label: 'Au moins une minuscule',
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    label: 'Au moins une majuscule',
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: 'Au moins un chiffre ou un caractère spécial',
    test: (p: string) => /[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p),
  },
]

interface PasswordChecklistProps {
  password: string
  className?: string
}

export function PasswordChecklist({ password, className = '' }: PasswordChecklistProps) {
  if (!password) return null

  const allValid = PASSWORD_RULES.every((r) => r.test(password))
  if (allValid) return null

  return (
    <ul className={`mt-2 space-y-1 ${className}`}>
      {PASSWORD_RULES.map((rule) => {
        const valid = rule.test(password)
        return (
          <li key={rule.label} className="flex items-center gap-2 text-sm">
            {valid ? (
              <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
            ) : (
              <X className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            )}
            <span className={valid ? 'text-text-secondary line-through' : 'text-text-secondary'}>
              {rule.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
