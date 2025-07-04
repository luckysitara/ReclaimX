"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./components/ui/button"
import { CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { LoadingSpinner } from "./components/ui/loading-spinner"
import { BlockchainAnimation } from "./components/ui/blockchain-animation"
import { AnimatedCard } from "./components/ui/animated-card"
import { FloatingElements } from "./components/ui/floating-elements"
import { ThemeProvider } from "./components/ui/theme-provider"
import { ThemeToggle } from "./components/ui/theme-toggle"
import { LayerZeroBackground } from "./components/ui/layerzero-background"
import { VaultCreation } from "./components/VaultCreation"
import { RecoveryManagement } from "./components/RecoveryManagement"
import { StakingInterface } from "./components/StakingInterface"
import { NotificationCenter } from "./components/NotificationCenter"
import {
  Wallet,
  Shield,
  Clock,
  Users,
  Activity,
  Globe,
  Link,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Code,
  HardDrive,
  Sparkles,
  Layers,
  CheckCircle,
  Network,
  Server,
  Cpu,
  AlertTriangle,
  Download,
} from "lucide-react"
import { useSolanaWallet, useEthereumWallet } from "./hooks/use-wallet"
import { useTokenBalances } from "./hooks/use-contracts"
import { useNotifications } from "./hooks/use-notifications"
import { SUPPORTED_CHAINS, SOLANA_NETWORKS } from "./constants/networks"
import { formatTokenAmount, formatAddress } from "./utils/validation"

interface SystemStats {
  activeVaults: number
  totalGuardians: number
  crossChainMessages: number
  totalStaked: string
}

function AppContent() {
  // Wallet hooks
  const { wallet: solanaWallet, connecting: solanaConnecting, connect: connectSolana } = useSolanaWallet()
  const { wallet: ethWallet, connecting: ethConnecting, connect: connectEth } = useEthereumWallet()

  // Contract hooks
  const { tokenBalance, stakedBalance, refetch: refetchBalances } = useTokenBalances()
  const { addNotification } = useNotifications()

  // State
  const [activeVaultId, setActiveVaultId] = useState<string>("")
  const [systemStats, setSystemStats] = useState<SystemStats>({
    activeVaults: 0,
    totalGuardians: 0,
    crossChainMessages: 0,
    totalStaked: "0",
  })

  // Auto-refresh balances when wallets connect
  useEffect(() => {
    if (ethWallet.connected) {
      refetchBalances()
    }
  }, [ethWallet.connected, refetchBalances])

  // Simulate system stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats((prev) => ({
        activeVaults: prev.activeVaults + Math.floor(Math.random() * 3),
        totalGuardians: prev.totalGuardians + Math.floor(Math.random() * 5),
        crossChainMessages: prev.crossChainMessages + Math.floor(Math.random() * 10),
        totalStaked: (Number.parseFloat(prev.totalStaked) + Math.random() * 1000).toString(),
      }))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleVaultCreated = (vaultId: string) => {
    setActiveVaultId(vaultId)
    addNotification("Vault Created", `Successfully created vault ${formatAddress(vaultId)}`, "success")
  }

  const refreshData = async () => {
    try {
      await refetchBalances()
      addNotification("Data Refreshed", "All data has been updated", "success")
    } catch (error) {
      addNotification("Refresh Failed", "Failed to refresh data", "error")
    }
  }

  const handleSolanaConnect = async () => {
    try {
      await connectSolana()
      if (solanaWallet.isDemo) {
        addNotification(
          "Demo Mode Active",
          "Connected in demo mode. Install Phantom wallet for full functionality.",
          "warning",
        )
      } else {
        addNotification("Phantom Connected", "Successfully connected to Phantom wallet", "success")
      }
    } catch (error: any) {
      addNotification("Connection Failed", error.message, "error")
    }
  }

  const handleEthConnect = async () => {
    try {
      await connectEth()
      if (ethWallet.isDemo) {
        addNotification(
          "Demo Mode Active",
          "Connected in demo mode. Install MetaMask for full functionality.",
          "warning",
        )
      } else {
        addNotification("MetaMask Connected", "Successfully connected to MetaMask wallet", "success")
      }
    } catch (error: any) {
      addNotification("Connection Failed", error.message, "error")
    }
  }

  return (
    <LayerZeroBackground variant="neural" intensity="subtle" className="min-h-screen">
      <FloatingElements count={25} variant="circles" />
      <NotificationCenter />

      {/* Theme Toggle - Floating */}
      <ThemeToggle variant="floating" />

      <div className="relative z-10 min-h-screen bg-gradient-to-br from-slate-50/95 via-blue-50/95 to-indigo-100/95 dark:from-slate-950/95 dark:via-slate-900/95 dark:to-indigo-950/95 backdrop-blur-sm">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-8 text-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <BlockchainAnimation variant="network" size="xl" />
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent animate-gradient">
                ReclaimX
              </h1>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
              Production-Ready Cross-Chain Wallet Recovery & Inheritance Protocol
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
              Powered by LayerZero V2 • Secured by Guardian Networks • Built for the Omnichain Future
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/70 dark:bg-slate-800/70 rounded-2xl backdrop-blur-md border border-white/30 dark:border-slate-700/50 shadow-lg">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{SOLANA_NETWORKS.DEVNET.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    EID: {SOLANA_NETWORKS.DEVNET.layerZeroEid}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/70 dark:bg-slate-800/70 rounded-2xl backdrop-blur-md border border-white/30 dark:border-slate-700/50 shadow-lg">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{SUPPORTED_CHAINS.ETHEREUM.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    EID: {SUPPORTED_CHAINS.ETHEREUM.layerZeroEid}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <AnimatedCard
            variant="glow"
            glowColor="blue"
            className="mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                Wallet Connection
                <div className="ml-auto">
                  <ThemeToggle variant="compact" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleSolanaConnect}
                  disabled={solanaConnecting}
                  variant={solanaWallet.connected ? "default" : "outline"}
                  className="relative overflow-hidden group h-14 text-base font-medium bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    {solanaConnecting ? (
                      <>
                        <LoadingSpinner variant="orbit" size="sm" className="mr-2" />
                        Connecting...
                      </>
                    ) : solanaWallet.connected ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        {solanaWallet.isDemo ? "Demo Mode" : "Phantom Connected"}
                        <BlockchainAnimation variant="pulse" size="sm" className="ml-2" />
                      </>
                    ) : (
                      <>
                        <Server className="w-5 h-5 mr-2" />
                        Connect Phantom
                      </>
                    )}
                  </div>
                </Button>

                <Button
                  onClick={handleEthConnect}
                  disabled={ethConnecting}
                  variant={ethWallet.connected ? "default" : "outline"}
                  className="relative overflow-hidden group h-14 text-base font-medium bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    {ethConnecting ? (
                      <>
                        <LoadingSpinner variant="dots" className="mr-2" />
                        Connecting...
                      </>
                    ) : ethWallet.connected ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        {ethWallet.isDemo ? "Demo Mode" : "MetaMask Connected"}
                        <BlockchainAnimation variant="connect" size="sm" className="ml-2" />
                      </>
                    ) : (
                      <>
                        <Network className="w-5 h-5 mr-2" />
                        Connect MetaMask
                      </>
                    )}
                  </div>
                </Button>
              </div>

              {/* Demo Mode Notice */}
              {(solanaWallet.isDemo || ethWallet.isDemo) && (
                <div className="mt-4 p-4 bg-amber-50/80 dark:bg-amber-950/80 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">Demo Mode Active</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    You're using demo wallets. Install the actual wallet extensions for full functionality:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {solanaWallet.isDemo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open("https://phantom.app/download", "_blank")}
                        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Install Phantom
                      </Button>
                    )}
                    {ethWallet.isDemo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open("https://metamask.io/download/", "_blank")}
                        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Install MetaMask
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Wallet Info */}
              {(ethWallet.connected || solanaWallet.connected) && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ethWallet.connected && (
                    <div className="p-3 bg-orange-50/80 dark:bg-orange-950/80 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Ethereum</p>
                        {ethWallet.isDemo && (
                          <Badge variant="outline" className="text-xs">
                            Demo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-orange-700 dark:text-orange-300">
                        {formatAddress(ethWallet.address || "")}
                      </p>
                      {ethWallet.chainId && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Chain ID: {ethWallet.chainId}
                        </Badge>
                      )}
                    </div>
                  )}

                  {solanaWallet.connected && (
                    <div className="p-3 bg-purple-50/80 dark:bg-purple-950/80 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Solana</p>
                        {solanaWallet.isDemo && (
                          <Badge variant="outline" className="text-xs">
                            Demo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-purple-700 dark:text-purple-300">
                        {formatAddress(solanaWallet.publicKey?.toString() || "")}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Devnet
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </AnimatedCard>

          {/* Token Balance Display */}
          {ethWallet.connected && (
            <AnimatedCard
              variant="hover-lift"
              className="mb-6 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/90 dark:to-indigo-950/90 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl"
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-slate-800/70 rounded-2xl backdrop-blur-md border border-white/30 dark:border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">RXOFT Balance</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {ethWallet.isDemo ? "10,000" : formatTokenAmount(tokenBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-slate-800/70 rounded-2xl backdrop-blur-md border border-white/30 dark:border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Staked</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {ethWallet.isDemo ? "5,000" : formatTokenAmount(stakedBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-slate-800/70 rounded-2xl backdrop-blur-md border border-white/30 dark:border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">APY</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          12.5%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <Button
                      onClick={refreshData}
                      variant="outline"
                      className="w-full h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 border-white/30 dark:border-slate-700/50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          )}

          {/* Main Tabs */}
          <Tabs defaultValue="vault" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl rounded-2xl">
              <TabsTrigger
                value="vault"
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Vault Management</span>
                <span className="sm:hidden">Vault</span>
              </TabsTrigger>
              <TabsTrigger
                value="recovery"
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Recovery</span>
                <span className="sm:hidden">Recovery</span>
              </TabsTrigger>
              <TabsTrigger
                value="staking"
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Guardian Staking</span>
                <span className="sm:hidden">Staking</span>
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">System Monitor</span>
                <span className="sm:hidden">Monitor</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vault" className="space-y-6">
              <VaultCreation onVaultCreated={handleVaultCreated} />
            </TabsContent>

            <TabsContent value="recovery" className="space-y-6">
              {activeVaultId ? (
                <RecoveryManagement vaultId={activeVaultId} />
              ) : (
                <AnimatedCard className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl">
                  <CardContent className="pt-6 text-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Vault Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a vault first or enter a vault ID to manage recovery
                    </p>
                    <div className="max-w-md mx-auto">
                      <input
                        type="text"
                        placeholder="Enter vault ID..."
                        className="w-full p-3 rounded-lg border border-white/30 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm"
                        onChange={(e) => setActiveVaultId(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </AnimatedCard>
              )}
            </TabsContent>

            <TabsContent value="staking" className="space-y-6">
              <StakingInterface />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* System Statistics */}
                <AnimatedCard
                  variant="glow"
                  glowColor="blue"
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Cpu className="w-5 h-5 text-white" />
                      </div>
                      System Statistics
                      <BlockchainAnimation variant="network" size="sm" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/80 dark:to-indigo-950/80 rounded-xl text-center border border-white/30 dark:border-slate-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Shield className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {systemStats.activeVaults.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Active Vaults</p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 rounded-xl text-center border border-white/30 dark:border-slate-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {systemStats.totalGuardians.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Guardians</p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/80 dark:to-pink-950/80 rounded-xl text-center border border-white/30 dark:border-slate-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <Network className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {systemStats.crossChainMessages.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Cross-Chain Messages</p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/80 dark:to-red-950/80 rounded-xl text-center border border-white/30 dark:border-slate-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          {formatTokenAmount(systemStats.totalStaked)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Staked</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Network Health</span>
                        <Badge variant="default" className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Excellent
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Solana Network</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Ethereum Network</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">LayerZero Bridge</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>

                {/* LayerZero Integration */}
                <AnimatedCard
                  variant="hover-lift"
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/20 dark:border-slate-700/50 shadow-xl"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      LayerZero Integration
                      <BlockchainAnimation variant="blocks" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/80 dark:to-indigo-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Solana Endpoint</span>
                          <Badge variant="outline" className="text-xs">
                            Devnet
                          </Badge>
                        </div>
                        <code className="text-xs bg-white/60 dark:bg-slate-800/60 p-2 rounded block font-mono border border-white/30 dark:border-slate-700/50">
                          {formatAddress(SOLANA_NETWORKS.DEVNET.layerZeroEndpoint)}
                        </code>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/80 dark:to-pink-950/80 rounded-xl border border-white/30 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Ethereum Endpoint</span>
                          <Badge variant="outline" className="text-xs">
                            Mainnet
                          </Badge>
                        </div>
                        <code className="text-xs bg-white/60 dark:bg-slate-800/60 p-2 rounded block font-mono border border-white/30 dark:border-slate-700/50">
                          {formatAddress(SUPPORTED_CHAINS.ETHEREUM.layerZeroEndpoint)}
                        </code>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg text-center border border-white/30 dark:border-slate-700/50">
                          <p className="text-sm font-medium text-muted-foreground">Solana EID</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {SOLANA_NETWORKS.DEVNET.layerZeroEid}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg text-center border border-white/30 dark:border-slate-700/50">
                          <p className="text-sm font-medium text-muted-foreground">Ethereum EID</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {SUPPORTED_CHAINS.ETHEREUM.layerZeroEid}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 border-white/30 dark:border-slate-700/50"
                        onClick={() => window.open("https://layerzeroscan.com/", "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        LayerZero Scan
                        <BlockchainAnimation variant="flow" size="sm" className="ml-auto" />
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 border-white/30 dark:border-slate-700/50"
                        onClick={() => window.open("https://docs.layerzero.network/v2/", "_blank")}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        LayerZero V2 Docs
                        <BlockchainAnimation variant="pulse" size="sm" className="ml-auto" />
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 border-white/30 dark:border-slate-700/50"
                        onClick={() => window.open("https://github.com/LayerZero-Labs/devtools", "_blank")}
                      >
                        <HardDrive className="w-4 h-4 mr-2" />
                        DevTools Repository
                        <BlockchainAnimation variant="connect" size="sm" className="ml-auto" />
                      </Button>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-16 text-center space-y-8">
            <div className="flex items-center justify-center gap-6 text-lg">
              <BlockchainAnimation variant="network" size="md" />
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Built with LayerZero V2
              </span>
              <BlockchainAnimation variant="blocks" />
              <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Production Ready
              </span>
              <BlockchainAnimation variant="connect" size="md" />
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <a
                href="https://layerzeroscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors duration-300 group"
              >
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                LayerZero Scan
              </a>
              <a
                href="https://docs.layerzero.network/v2/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors duration-300 group"
              >
                <Code className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Documentation
              </a>
              <a
                href="https://github.com/LayerZero-Labs/devtools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors duration-300 group"
              >
                <HardDrive className="w-4 h-4 group-hover:scale-110 transition-transform" />
                GitHub
              </a>
            </div>

            <div className="max-w-4xl mx-auto">
              <p className="text-xs text-muted-foreground leading-relaxed">
                ReclaimX is a production-ready cross-chain wallet recovery protocol that leverages LayerZero V2's
                omnichain infrastructure to provide secure, decentralized asset recovery and inheritance solutions
                across Solana and Ethereum ecosystems. Built with real wallet connections and fully functional smart
                contracts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayerZeroBackground>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="reclaimx-ui-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
