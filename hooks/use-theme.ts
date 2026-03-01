"use client"

import * as React from "react"

// Cosmic White — единственная и основная тема
type Theme = "cosmic"

interface UseThemeReturn {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

export function useTheme(): UseThemeReturn {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Устанавливаем cosmic тему по умолчанию
    document.documentElement.setAttribute("data-theme", "cosmic")
    localStorage.setItem("lifeos-theme", "cosmic")
  }, [])

  const setTheme = React.useCallback((theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("lifeos-theme", theme)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return { theme: "cosmic", setTheme, themes: ["cosmic"] }
  }

  return {
    theme: "cosmic",
    setTheme,
    themes: ["cosmic"],
  }
}

/* 
  Использование:
  
  const { theme } = useTheme()
  // theme всегда "cosmic"
  
  // CSS переменные для компонентов:
  // --primary: белый (#FFFFFF)
  // --accent: фиолетовый (#7B61FF)
  // --primary-glow: белое свечение
  // --accent-glow: фиолетовое свечение
*/
