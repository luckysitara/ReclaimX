"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { LoadingSpinner } from "./ui/loading-spinner"
import { Shield, Users, Clock, Plus, X, AlertTriangle } from "lucide-react"
import { useEthereumContracts } from "../hooks/use-contracts"
import { useNotifications } from "../hooks/use-notifications"
import { type VaultConfig, createVaultService } from "../services/vault-service"
import { validateVaultConfig } from "../utils/validation"

interface VaultCreationProps {
  onVaultCreated: (vaultId: string) => void
}

export function VaultCreation({ onVaultCreated }: VaultCreationProps) {
  const { recoveryContract, oftContract, connected } = useEthereumContracts()
  const { addNotification } = useNotifications()

  const [config, setConfig] = useState<VaultConfig>({
    guardians: [""],
    threshold: 1,
    timelock: 3600, // 1 hour
    inactivityPeriod: 86400, // 24 hours
    backupWallet: "",
    stakeAmount: "1000",
    assets: [],
  })

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const addGuardian = () => {
    setConfig((prev) => ({
      ...prev,
      guardians: [...prev.guardians, ""],
    }))
  }

  const removeGuardian = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      guardians: prev.guardians.filter((_, i) => i !== index),
    }))
  }

  const updateGuardian = (index: number, value: string) => {
    setConfig((prev) => ({
      ...prev,
      guardians: prev.guardians.map((guardian, i) => (i === index ? value : guardian)),
    }))
  }

  const validateForm = (): boolean => {
    const validationErrors = validateVaultConfig(config)
    setErrors(validationErrors)
    return validationErrors.length === 0
  }

  const createVault = async () => {
    if (!connected || !recoveryContract || !oftContract) {
      addNotification("Error", "Please connect your wallet first", "error")
      return
    }

    if (!validateForm()) {
      addNotification("Validation Error", "Please fix the form errors", "error")
      return
    }

    setLoading(true)
    setProgress(0)

    try {
      const vaultService = createVaultService(recoveryContract, oftContract)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 500)

      const vaultId = await vaultService.createVault(config)

      clearInterval(progressInterval)
      setProgress(100)

      addNotification("Vault Created Successfully!", `Vault ID: ${vaultId.slice(0, 12)}...`, "success", vaultId)

      onVaultCreated(vaultId)

      // Reset form
      setConfig({
        guardians: [""],
        threshold: 1,
        timelock: 3600,
        inactivityPeriod: 86400,
        backupWallet: "",
        stakeAmount: "1000",
        assets: [],
      })
    } catch (error: any) {
      addNotification("Creation Failed", error.message, "error")
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          Create Secure Vault
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guardians Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Guardian Addresses
            </label>
            <Button type="button" variant="outline" size="sm" onClick={addGuardian} className="h-8 bg-transparent">
              <Plus className="w-4 h-4 mr-1" />
              Add Guardian
            </Button>
          </div>

          <div className="space-y-2">
            {config.guardians.map((guardian, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={guardian}
                  onChange={(e) => updateGuardian(index, e.target.value)}
                  className="flex-1 h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
                />
                {config.guardians.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGuardian(index)}
                    className="h-12 w-12 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Approval Threshold</label>
            <Input
              type="number"
              value={config.threshold}
              onChange={(e) => setConfig((prev) => ({ ...prev, threshold: Number(e.target.value) }))}
              min="1"
              max={config.guardians.length}
              className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
            />
            <p className="text-xs text-muted-foreground">Number of guardians required to approve recovery</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timelock (seconds)
            </label>
            <Input
              type="number"
              value={config.timelock}
              onChange={(e) => setConfig((prev) => ({ ...prev, timelock: Number(e.target.value) }))}
              min="0"
              className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
            />
            <p className="text-xs text-muted-foreground">Delay before recovery can be executed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Inactivity Period (seconds)</label>
            <Input
              type="number"
              value={config.inactivityPeriod}
              onChange={(e) => setConfig((prev) => ({ ...prev, inactivityPeriod: Number(e.target.value) }))}
              min="0"
              className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
            />
            <p className="text-xs text-muted-foreground">Time before automatic recovery to backup wallet</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stake Amount (RXOFT)</label>
            <Input
              type="number"
              value={config.stakeAmount}
              onChange={(e) => setConfig((prev) => ({ ...prev, stakeAmount: e.target.value }))}
              min="0"
              className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
            />
            <p className="text-xs text-muted-foreground">Required stake amount for guardians</p>
          </div>
        </div>

        {/* Backup Wallet */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Backup Wallet Address</label>
          <Input
            placeholder="0x..."
            value={config.backupWallet}
            onChange={(e) => setConfig((prev) => ({ ...prev, backupWallet: e.target.value }))}
            className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
          />
          <p className="text-xs text-muted-foreground">Address to receive assets if vault becomes inactive</p>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50/80 dark:bg-red-950/80 rounded-xl border border-red-200/50 dark:border-red-800/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-800 dark:text-red-200">Validation Errors</span>
            </div>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress */}
        {loading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Creating Vault...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} variant="animated" className="h-3" />
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={createVault}
          disabled={loading || !connected}
          className="w-full h-14 text-base font-medium bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
        >
          {loading ? (
            <>
              <LoadingSpinner variant="orbit" size="sm" className="mr-2" />
              Creating Vault...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Create Secure Vault
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-4 bg-blue-50/80 dark:bg-blue-950/80 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Vault Features</h4>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>• Cross-chain recovery via LayerZero V2</li>
            <li>• Guardian-based approval system</li>
            <li>• Automatic inheritance after inactivity</li>
            <li>• Slashing protection against malicious guardians</li>
            <li>• Multi-asset support (tokens & NFTs)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
