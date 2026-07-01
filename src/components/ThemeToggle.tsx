import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
