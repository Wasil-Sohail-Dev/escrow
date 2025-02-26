"use client"

import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 text-paragraph dark:text-dark-text hover:bg-primary-100 dark:hover:bg-dark-input-bg rounded-lg"
    >
      <span className="sr-only">Toggle theme</span>
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  )
} 