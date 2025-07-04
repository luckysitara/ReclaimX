"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { LoadingSpinner } from "./ui/loading-spinner"
import { ArrowRightLeft, CheckCircle, Clock, Users, ExternalLink, AlertTriangle } from "lucide-react"
import { useEthereumContracts } from "../hooks/use-contracts"
import { useNotifications } from "../hooks/use-notifications"
import { type RecoveryInfo, type VaultInfo, createVaultService } from "../services/vault-service"
import { formatAddress, getLayerZeroScanUrl } from "../utils/validation"

interface RecoveryManagementProps {
  vaultId: string
}

export function RecoveryManagement({ vaultId }: RecoveryManagementProps) {
  const { recoveryContract, oftContract, connected, chainId } = useEthereumContracts()
  const { addNotification } = useNotifications()

  const [newOwner, setNewOwner] = useState("")
  const [recoveryId, setRecoveryId] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null)
  const [recoveryInfo, setRecoveryInfo] = useState<RecoveryInfo | null>(null)
  const [txHash, setTxHash] = useState("")

  useEffect(() => {
    if (vaultId && recoveryContract) {
      loadVaultInfo()
    }
  }, [vaultId, recoveryContract])

  useEffect(() => {
    if (vaultInfo && recoveryContract && vaultInfo.recoveryId > 0) {
      loadRecoveryInfo()
    }
  }, [vaultInfo, recoveryContract])

  const loadVaultInfo = async () => {
    if (!recoveryContract) return

    try {
      const vaultService = createVaultService(recoveryContract, oftContract!)
      const info = await vaultService.getVaultInfo(vaultId)
      setVaultInfo(info)
      if (info) {
        setRecoveryId(info.recoveryId)
      }
    } catch (error) {
      console.error("Failed to load vault info:", error)
    }
  }

  const loadRecoveryInfo = async () => {
    if (!recoveryContract || !vaultInfo) return

    try {
      const vaultService = createVaultService(recoveryContract, oftContract!)
      const info = await vaultService.getRecoveryInfo(vaultId, vaultInfo.recoveryId)
      setRecoveryInfo(info)
    } catch (error) {
      console.error("Failed to load recovery info:", error)
    }
  }

  const initiateRecovery = async () => {
    if (!connected || !recoveryContract || !oftContract || !newOwner) {
      addNotification("Error", "Please fill all required fields", "error")
      return
    }

    setLoading(true)
    setProgress(0)

    try {
      const vaultService = createVaultService(recoveryContract, oftContract)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90))
      }, 800)

      const hash = await vaultService.initiateRecovery(vaultId, newOwner)

      clearInterval(progressInterval)
      setProgress(100)
      setTxHash(hash)

      addNotification(
        "Recovery Initiated",
        "Cross-chain recovery process started successfully",
        "success",
        hash,
        chainId || undefined,
      )

      // Reload vault info
      await loadVaultInfo()
    } catch (error: any) {
      addNotification("Recovery Failed", error.message, "error")
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const approveRecovery = async () => {
    if (!connected || !recoveryContract || !oftContract || !recoveryId) {
      addNotification("Error", "No active recovery to approve", "error")
      return
    }

    setLoading(true)

    try {
      const vaultService = createVaultService(recoveryContract, oftContract)
      const hash = await vaultService.approveRecovery(vaultId, recoveryId)

      addNotification("Recovery Approved", "Your approval has been recorded", "success", hash, chainId || undefined)

      // Reload recovery info
      await loadRecoveryInfo()
    } catch (error: any) {
      addNotification("Approval Failed", error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const markMalicious = async (guardian: string) => {
    if (!connected || !recoveryContract || !oftContract || !recoveryId) {
      addNotification("Error", "No active recovery process", "error")
      return
    }

    try {
      const vaultService = createVaultService(recoveryContract, oftContract)
      const hash = await vaultService.markMalicious(vaultId, recoveryId, guardian)

      addNotification(
        "Guardian Marked as Malicious",
        `Guardian ${formatAddress(guardian)} has been flagged`,
        "warning",
        hash,
        chainId || undefined,
      )

      // Reload recovery info
      await loadRecoveryInfo()
    } catch (error: any) {
      addNotification("Failed to Mark Malicious", error.message, "error")
    }
  }

  const getRecoveryStateText = (state: number) => {
    switch (state) {
      case 0:
        return "None"
      case 1:
        return "Pending"
      case 2:
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const getRecoveryStateBadge = (state: number) => {
    switch (state) {
      case 0:
        return "secondary"
      case 1:
        return "destructive"
      case 2:
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Recovery Initiation */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            Recovery Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Owner Address</label>
            <Input
              placeholder="0x..."
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
            />
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cross-Chain Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} variant="gradient" className="h-3" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={initiateRecovery}
              disabled={loading || !connected || !newOwner}
              className="h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              {loading ? (
                <LoadingSpinner variant="dots" className="mr-2" />
              ) : (
                <ArrowRightLeft className="w-4 h-4 mr-2" />
              )}
              Initiate Recovery
            </Button>

            <Button
              onClick={approveRecovery}
              disabled={loading || !connected || !recoveryInfo}
              variant="outline"
              className="h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 border-white/30 dark:border-slate-700/50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Recovery
            </Button>
          </div>

          {txHash && (
            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/80 dark:to-indigo-950/80 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Transaction Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white/60 dark:bg-slate-800/60 rounded font-mono text-sm border border-white/30 dark:border-slate-700/50">
                  {formatAddress(txHash)}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(getLayerZeroScanUrl(txHash), "_blank")}
                  className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery Status */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            Recovery Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {vaultInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/80 dark:to-indigo-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Owner</span>
                </div>
                <p className="font-mono text-sm">{formatAddress(vaultInfo.owner)}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </div>
                <Badge variant={getRecoveryStateBadge(vaultInfo.recoveryState)} className="text-sm">
                  {getRecoveryStateText(vaultInfo.recoveryState)}
                </Badge>
              </div>
            </div>
          )}

          {recoveryInfo ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Guardian Approvals
                  </span>
                  <Badge variant="outline" className="text-sm">
                    {recoveryInfo.approvals.length}/{vaultInfo?.threshold || 3}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {Array.from({ length: vaultInfo?.threshold || 3 }).map((_, index) => {
                    const hasApproval = index < recoveryInfo.approvals.length
                    const guardian = hasApproval ? recoveryInfo.approvals[index] : null

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 border ${
                          hasApproval
                            ? "bg-green-50/80 dark:bg-green-950/80 border-green-200/50 dark:border-green-800/50"
                            : "bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50"
                        }`}
                      >
                        <span className="font-mono text-sm">
                          {hasApproval ? formatAddress(guardian!) : "Pending approval..."}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasApproval ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                          {hasApproval && guardian && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markMalicious(guardian)}
                              className="h-6 px-2 text-xs"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Flag
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Approval Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((recoveryInfo.approvals.length / (vaultInfo?.threshold || 3)) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(recoveryInfo.approvals.length / (vaultInfo?.threshold || 3)) * 100}
                    variant="gradient"
                    className="h-2"
                  />
                </div>

                {recoveryInfo.newOwner && (
                  <div className="p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/80 dark:to-pink-950/80 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">New Owner</span>
                    </div>
                    <p className="font-mono text-sm">{formatAddress(recoveryInfo.newOwner)}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No active recovery process</p>
              <p className="text-sm text-muted-foreground mt-2">Initiate a recovery to see status information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
