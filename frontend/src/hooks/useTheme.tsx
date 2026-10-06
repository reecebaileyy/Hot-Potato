import React, { createContext, useContext } from 'react'
import { useDarkMode } from './useDarkMode'

interface Theme {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  toggle: () => void
}

const ThemeContext = createContext<Theme | null>(null)

/** Owns the dark-mode flag for the whole app, so pages and components don't pass it around. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useDarkMode()
  const value: Theme = {
    darkMode,
    setDarkMode,
    toggle: () => setDarkMode(!darkMode),
  }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider')
  return theme
}
