"use client"

import type * as React from "react"
import { cn } from "../../lib/utils"

interface LayerZeroBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "mesh" | "grid" | "dots" | "waves" | "neural"
  intensity?: "subtle" | "medium" | "strong"
  animated?: boolean
}

export function LayerZeroBackground({
  className,
  variant = "mesh",
  intensity = "medium",
  animated = true,
  children,
  ...props
}: LayerZeroBackgroundProps) {
  const intensityClasses = {
    subtle: "opacity-20",
    medium: "opacity-40",
    strong: "opacity-60",
  }

  if (variant === "neural") {
    return (
      <div ref={null} className={cn("relative overflow-hidden", className)} {...props}>
        <div className={cn("absolute inset-0", intensityClasses[intensity])}>
          <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Neural Network Nodes */}
            {Array.from({ length: 20 }).map((_, i) => {
              const x = (i % 5) * 200 + 100
              const y = Math.floor(i / 5) * 200 + 100
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="url(#neuralGradient)"
                    className={animated ? "animate-pulse" : ""}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                  {/* Connections */}
                  {i < 15 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={((i + 5) % 5) * 200 + 100}
                      y2={Math.floor((i + 5) / 5) * 200 + 100}
                      stroke="url(#neuralGradient)"
                      strokeWidth="1"
                      className={animated ? "animate-pulse" : ""}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        {children}
      </div>
    )
  }

  if (variant === "mesh") {
    return (
      <div ref={null} className={cn("relative overflow-hidden", className)} {...props}>
        <div className={cn("absolute inset-0", intensityClasses[intensity])}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10" />
          <div
            className={cn("absolute inset-0 bg-mesh-pattern", animated && "animate-mesh-move")}
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #8B5CF6 0%, transparent 50%),
                radial-gradient(circle at 75% 25%, #06B6D4 0%, transparent 50%),
                radial-gradient(circle at 25% 75%, #EC4899 0%, transparent 50%)
              `,
              backgroundSize: "400px 400px",
            }}
          />
        </div>
        {children}
      </div>
    )
  }

  if (variant === "waves") {
    return (
      <div ref={null} className={cn("relative overflow-hidden", className)} {...props}>
        <div className={cn("absolute inset-0", intensityClasses[intensity])}>
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent",
                  animated && "animate-wave-flow",
                )}
                style={{
                  transform: `translateY(${i * 20}px)`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${4 + i}s`,
                }}
              />
            ))}
          </div>
        </div>
        {children}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div ref={null} className={cn("relative overflow-hidden", className)} {...props}>
        <div className={cn("absolute inset-0", intensityClasses[intensity])}>
          <div
            className={cn("absolute inset-0", animated && "animate-dots-pulse")}
            style={{
              backgroundImage: `
                radial-gradient(circle, #3B82F6 1px, transparent 1px),
                radial-gradient(circle, #8B5CF6 1px, transparent 1px),
                radial-gradient(circle, #06B6D4 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px, 75px 75px, 100px 100px",
              backgroundPosition: "0 0, 25px 25px, 50px 50px",
            }}
          />
        </div>
        {children}
      </div>
    )
  }

  // Default grid variant
  return (
    <div ref={null} className={cn("relative overflow-hidden", className)} {...props}>
      <div className={cn("absolute inset-0", intensityClasses[intensity])}>
        <div
          className={cn("absolute inset-0", animated && "animate-grid-flow")}
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px, 50px 50px, 100px 100px, 100px 100px",
          }}
        />
      </div>
      {children}
    </div>
  )
}
