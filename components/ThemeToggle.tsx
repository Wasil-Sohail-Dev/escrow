"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-7 right-7 p-3 rounded-full 
        bg-white-2 dark:bg-dark-2
        hover:bg-white-3 dark:hover:bg-dark-3 
        text-dark-1 dark:text-white-1
        transition-all duration-300
        shadow-soft "
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
