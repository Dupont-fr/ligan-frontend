import { Coffee, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { applyTheme, getInitialTheme, type ThemeMode } from '../../lib/theme'

const MODES: ThemeMode[] = ['system', 'light', 'dark', 'comfort']
const ICONS: Record<ThemeMode, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
  comfort: Coffee,
}
const LABELS: Record<ThemeMode, string> = {
  system: 'Système',
  light: 'Clair',
  dark: 'Sombre',
  comfort: 'Confort',
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  const Icon = ICONS[mode]
  const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length]

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`Thème : ${LABELS[mode]}. Passer en mode ${LABELS[next]}.`}
      title={`Thème : ${LABELS[mode]}`}
      className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-full)] border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{LABELS[mode]}</span>
    </button>
  )
}
