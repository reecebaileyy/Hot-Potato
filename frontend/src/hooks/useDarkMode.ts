import { useEffect, useState } from 'react'

const STORAGE_KEY = 'darkMode'

function readStoredDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'false') === true
  } catch {
    return false
  }
}

/** Dark mode flag persisted in localStorage and mirrored on <html class="dark">. */
export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(readStoredDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(darkMode))
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }, [darkMode])

  return [darkMode, setDarkMode] as const
}
