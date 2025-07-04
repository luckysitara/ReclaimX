"use client"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { CheckCircle, AlertTriangle, Info, X, ExternalLink } from "lucide-react"
import { useNotifications, type Notification } from "../hooks/use-notifications"
import { getExplorerUrl, formatAddress } from "../utils/validation"

export function NotificationCenter() {
  const { notifications, removeNotification, clearAll } = useNotifications()

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50/95 dark:bg-green-950/95 border-green-200/50 dark:border-green-800/50"
      case "error":
        return "bg-red-50/95 dark:bg-red-950/95 border-red-200/50 dark:border-red-800/50"
      case "warning":
        return "bg-amber-50/95 dark:bg-amber-950/95 border-amber-200/50 dark:border-amber-800/50"
      default:
        return "bg-blue-50/95 dark:bg-blue-950/95 border-blue-200/50 dark:border-blue-800/50"
    }
  }

  const getTextColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200"
      case "error":
        return "text-red-800 dark:text-red-200"
      case "warning":
        return "text-amber-800 dark:text-amber-200"
      default:
        return "text-blue-800 dark:text-blue-200"
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/30 dark:border-slate-700/50"
          >
            Clear All
          </Button>
        </div>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-xl shadow-xl backdrop-blur-md border animate-slide-in-right ${getBackgroundColor(
            notification.type,
          )}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${getTextColor(notification.type)}`}>{notification.title}</h4>
              <p className={`text-sm mt-1 ${getTextColor(notification.type)} opacity-90`}>{notification.message}</p>

              {notification.txHash && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {formatAddress(notification.txHash)}
                  </Badge>
                  {notification.chainId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(notification.txHash!, notification.chainId!), "_blank")}
                      className="h-6 px-2 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}

              <p className={`text-xs mt-2 ${getTextColor(notification.type)} opacity-70`}>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeNotification(notification.id)}
              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
