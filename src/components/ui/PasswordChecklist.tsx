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

/* N'affiche que les règles encore à satisfaire :
   une règle respectée disparaît de la liste. */
export function PasswordChecklist({ password, className = '' }: PasswordChecklistProps) {
  if (!password) return null

  const remaining = PASSWORD_RULES.filter((rule) => !rule.test(password))
  if (remaining.length === 0) return null

  return (
    <ul className={`mt-2 space-y-1 ${className}`}>
      {remaining.map((rule) => (
        <li key={rule.label} className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
