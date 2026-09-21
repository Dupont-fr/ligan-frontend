export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'ligan-theme'

export function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && systemDark)
  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  localStorage.setItem(STORAGE_KEY, mode)
}

export function initTheme(): void {
  applyTheme(getInitialTheme())
}