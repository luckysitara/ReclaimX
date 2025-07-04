"use client"

import { useState, useCallback } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "error" | "warning" | "info"
  timestamp: number
  txHash?: string
  chainId?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (title: string, message: string, type: Notification["type"] = "info", txHash?: string, chainId?: number) => {
      const id = Math.random().toString(36).substr(2, 9)
      const notification: Notification = {
        id,
        title,
        message,
        type,
        timestamp: Date.now(),
        txHash,
        chainId,
      }

      setNotifications((prev) => [notification, ...prev])

      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 10000)

      return id
    },
    [],
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  }
}
