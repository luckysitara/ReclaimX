"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoadingSpinner } from "./ui/loading-spinner"
import { Lock, Coins, TrendingUp, AlertTriangle, CheckCircle, Minus } from "lucide-react"
import { useEthereumContracts, useTokenBalances } from "../hooks/use-contracts"
import { useNotifications } from "../hooks/use-notifications"
import { createVaultService } from "../services/vault-service"
import { formatTokenAmount } from "../utils/validation"

export function StakingInterface() {
  const { recoveryContract, oftContract, connected, address } = useEthereumContracts()
  const { tokenBalance, stakedBalance, loading: balanceLoading, refetch } = useTokenBalances()
  const { addNotification } = useNotifications()

  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake")

  useEffect(() => {
    if (connected) {
      refetch()
    }
  }, [connected, refetch])

  const stakeTokens = async () => {
    if (!connected || !recoveryContract || !oftContract || !stakeAmount) {
      addNotification("Error", "Please connect wallet and enter stake amount", "error")
      return
    }

    const amount = Number.parseFloat(stakeAmount)
    const balance = Number.parseFloat(tokenBalance)

    if (amount <= 0) {
      addNotification("Error", "Stake amount must be greater than 0", "error")
      return
    }

    if (amount > balance) {
      addNotification("Error", "Insufficient balance", "error")
      return
    }

    if (amount < 100) {
      addNotification("Error", "Minimum stake amount is 100 RXOFT", "error")
      return
    }

    setLoading(true)

    try {
      const vaultService = createVaultService(recoveryContract, oftContract)
      const hash = await vaultService.stakeTokens(stakeAmount)

      addNotification(
        "Tokens Staked Successfully",
        `Staked ${formatTokenAmount(stakeAmount)} RXOFT tokens`,
        "success",
        hash,
      )

      setStakeAmount("")
      await refetch()
    } catch (error: any) {
      addNotification("Staking Failed", error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const unstakeTokens = async () => {
    if (!connected || !recoveryContract || !oftContract || !unstakeAmount) {
      addNotification("Error", "Please connect wallet and enter unstake amount", "error")
      return
    }

    const amount = Number.parseFloat(unstakeAmount)
    const staked = Number.parseFloat(stakedBalance)

    if (amount <= 0) {
      addNotification("Error", "Unstake amount must be greater than 0", "error")
      return
    }

    if (amount > staked) {
      addNotification("Error", "Insufficient staked balance", "error")
      return
    }

    setLoading(true)

    try {
      const vaultService = createVaultService(recoveryContract, oftContract)
      const hash = await vaultService.unstakeTokens(unstakeAmount)

      addNotification(
        "Tokens Unstaked Successfully",
        `Unstaked ${formatTokenAmount(unstakeAmount)} RXOFT tokens`,
        "success",
        hash,
      )

      setUnstakeAmount("")
      await refetch()
    } catch (error: any) {
      addNotification("Unstaking Failed", error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const setMaxStake = () => {
    setStakeAmount(tokenBalance)
  }

  const setMaxUnstake = () => {
    setUnstakeAmount(stakedBalance)
  }

  const calculateAPY = () => {
    return 12.5 // Fixed APY for demo
  }

  const calculateYearlyRewards = () => {
    const staked = Number.parseFloat(stakedBalance) || 0
    return (staked * calculateAPY()) / 100
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          Guardian Staking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/80 dark:to-indigo-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-blue-500" />
                <span className="font-medium">Available</span>
              </div>
              {balanceLoading && <LoadingSpinner size="sm" />}
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {formatTokenAmount(tokenBalance)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">RXOFT Tokens</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-500" />
                <span className="font-medium">Staked</span>
              </div>
              {balanceLoading && <LoadingSpinner size="sm" />}
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatTokenAmount(stakedBalance)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">RXOFT Tokens</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/80 dark:to-pink-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <span className="font-medium">APY</span>
              </div>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {calculateAPY()}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Annual Yield</p>
          </div>
        </div>

        {/* Staking Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab("stake")}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
              activeTab === "stake"
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Stake Tokens
          </button>
          <button
            onClick={() => setActiveTab("unstake")}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
              activeTab === "unstake"
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Unstake Tokens
          </button>
        </div>

        {/* Stake Tab */}
        {activeTab === "stake" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Stake Amount (RXOFT)
                </label>
                <Button variant="outline" size="sm" onClick={setMaxStake} className="h-6 px-2 text-xs bg-transparent">
                  Max
                </Button>
              </div>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount to stake"
                min="0"
                step="0.01"
                className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-lg border-white/30 dark:border-slate-700/50"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Min: 100 RXOFT</span>
                <span>Available: {formatTokenAmount(tokenBalance)} RXOFT</span>
              </div>
            </div>

            <Button
              onClick={stakeTokens}
              disabled={loading || !connected || !stakeAmount || Number.parseFloat(stakeAmount) < 100}
              className="w-full h-14 text-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              {loading ? (
                <>
                  <LoadingSpinner variant="orbit" size="sm" className="mr-2" />
                  Staking {formatTokenAmount(stakeAmount)} RXOFT...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Stake {stakeAmount ? formatTokenAmount(stakeAmount) : "0"} RXOFT
                </>
              )}
            </Button>
          </div>
        )}

        {/* Unstake Tab */}
        {activeTab === "unstake" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  Unstake Amount (RXOFT)
                </label>
                <Button variant="outline" size="sm" onClick={setMaxUnstake} className="h-6 px-2 text-xs bg-transparent">
                  Max
                </Button>
              </div>
              <Input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="Enter amount to unstake"
                min="0"
                step="0.01"
                className="h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-lg border-white/30 dark:border-slate-700/50"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>7-day unstaking period</span>
                <span>Staked: {formatTokenAmount(stakedBalance)} RXOFT</span>
              </div>
            </div>

            <Button
              onClick={unstakeTokens}
              disabled={loading || !connected || !unstakeAmount || Number.parseFloat(unstakeAmount) <= 0}
              variant="outline"
              className="w-full h-14 text-lg font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 border-white/30 dark:border-slate-700/50"
            >
              {loading ? (
                <>
                  <LoadingSpinner variant="orbit" size="sm" className="mr-2" />
                  Unstaking {formatTokenAmount(unstakeAmount)} RXOFT...
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5 mr-2" />
                  Unstake {unstakeAmount ? formatTokenAmount(unstakeAmount) : "0"} RXOFT
                </>
              )}
            </Button>
          </div>
        )}

        {/* Rewards Information */}
        {Number.parseFloat(stakedBalance) > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 rounded-xl border border-green-200/50 dark:border-green-800/50">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Staking Rewards
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Yearly Rewards</p>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatTokenAmount(calculateYearlyRewards().toString())} RXOFT
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Rewards</p>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatTokenAmount((calculateYearlyRewards() / 12).toString())} RXOFT
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Staking Information */}
        <div className="p-6 bg-gradient-to-r from-slate-50/80 to-gray-50/80 dark:from-slate-800/80 dark:to-gray-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Staking Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Earn {calculateAPY()}% APY on staked tokens
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Participate in governance voting
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cross-chain staking via LayerZero OFT
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Minimum stake: 100 RXOFT
              </p>
              <p className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Malicious guardians get slashed
              </p>
              <p className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                7-day unstaking period
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
