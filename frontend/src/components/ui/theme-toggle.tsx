"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "./button"
import { useTheme } from "./theme-provider"
import { cn } from "../../lib/utils"

interface ThemeToggleProps {
  variant?: "default" | "floating" | "compact"
  className?: string
}

export function ThemeToggle({ variant = "default", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const

  if (variant === "floating") {
    return (
      <div className={cn("fixed top-4 left-4 z-50", className)}>
        <div className="flex items-center p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-white/20 dark:border-slate-700/50 shadow-lg">
          {themes.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              onClick={() => setTheme(value)}
              className={cn(
                "relative h-8 w-8 rounded-full p-0 transition-all duration-300",
                theme === value
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400",
              )}
              title={label}
            >
              <Icon className="h-4 w-4" />
              {theme === value && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    const currentTheme = themes.find((t) => t.value === theme)
    const CurrentIcon = currentTheme?.icon || Sun

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.value === theme)
          const nextIndex = (currentIndex + 1) % themes.length
          setTheme(themes[nextIndex].value)
        }}
        className={cn(
          "relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300",
          className,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <CurrentIcon className="h-4 w-4 mr-2" />
        <span className="capitalize">{theme}</span>
      </Button>
    )
  }

  // Default variant - segmented control
  return (
    <div className={cn("flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg", className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-300",
            theme === value
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
          {theme === value && (
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/5 to-purple-600/5" />
          )}
        </Button>
      ))}
    </div>
  )
}
