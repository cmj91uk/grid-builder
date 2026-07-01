export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'grid-builder:theme'

export function loadStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

export function saveStoredTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
