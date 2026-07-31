import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('cms_theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('cms_theme', dark ? 'dark' : 'light')
  }, [dark])

  return <ThemeContext.Provider value={{ dark, toggle: () => setDark((v) => !v) }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
