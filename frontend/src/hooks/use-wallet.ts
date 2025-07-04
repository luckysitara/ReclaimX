"use client"

import { useState, useEffect, useCallback } from "react"
import { PublicKey, type Transaction } from "@solana/web3.js"
import { ethers } from "ethers"

export interface SolanaWallet {
  publicKey: PublicKey | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  isDemo?: boolean
}

export interface EthereumWallet {
  address: string | null
  connected: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  chainId: number | null
  isDemo?: boolean
}

// Helper function to detect if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Helper function to check if MetaMask is available
const isMetaMaskAvailable = (): boolean => {
  if (!isBrowser) return false
  const ethereum = (window as any).ethereum
  return !!(ethereum && (ethereum.isMetaMask || ethereum.providers?.some((p: any) => p.isMetaMask)))
}

// Helper function to check if Phantom is available
const isPhantomAvailable = (): boolean => {
  if (!isBrowser) return false
  const solana = (window as any).solana
  return !!(solana && solana.isPhantom)
}

// Generate demo addresses
const generateDemoSolanaAddress = () => {
  try {
    return new PublicKey("DemoSolanaWallet1234567890123456789012345678")
  } catch {
    // Fallback if PublicKey creation fails
    return null
  }
}

const generateDemoEthAddress = () => "0x1234567890123456789012345678901234567890"

export function useSolanaWallet() {
  const [wallet, setWallet] = useState<SolanaWallet>({
    publicKey: null,
    connected: false,
    connect: async () => {},
    disconnect: async () => {},
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
    isDemo: false,
  })
  const [connecting, setConnecting] = useState(false)

  const connectDemo = useCallback(async () => {
    const demoPublicKey = generateDemoSolanaAddress()

    setWallet({
      publicKey: demoPublicKey,
      connected: true,
      connect: connectDemo,
      disconnect,
      signTransaction: async (tx) => tx, // Demo mode - just return the transaction
      signAllTransactions: async (txs) => txs, // Demo mode - just return the transactions
      isDemo: true,
    })
  }, [])

  const connect = useCallback(async () => {
    if (connecting) return
    setConnecting(true)

    try {
      // Check if we're in browser environment
      if (!isBrowser) {
        throw new Error("Wallet connection is only available in browser environment")
      }

      // Check if Phantom wallet is available
      if (!isPhantomAvailable()) {
        // Instead of throwing an error, connect in demo mode
        console.log("Phantom wallet not found, connecting in demo mode")
        await connectDemo()
        return
      }

      const { solana } = window as any

      // Connect to Phantom
      const response = await solana.connect({ onlyIfTrusted: false })
      const publicKey = new PublicKey(response.publicKey.toString())

      setWallet({
        publicKey,
        connected: true,
        connect,
        disconnect,
        signTransaction: async (transaction: Transaction) => {
          try {
            const signedTransaction = await solana.signTransaction(transaction)
            return signedTransaction
          } catch (error) {
            console.error("Failed to sign transaction:", error)
            throw error
          }
        },
        signAllTransactions: async (transactions: Transaction[]) => {
          try {
            const signedTransactions = await solana.signAllTransactions(transactions)
            return signedTransactions
          } catch (error) {
            console.error("Failed to sign transactions:", error)
            throw error
          }
        },
        isDemo: false,
      })
    } catch (error: any) {
      console.error("Failed to connect Solana wallet:", error)

      // If connection fails, try demo mode as fallback
      if (!wallet.isDemo) {
        console.log("Falling back to demo mode")
        await connectDemo()
        return
      }

      throw error
    } finally {
      setConnecting(false)
    }
  }, [connecting, connectDemo, wallet.isDemo])

  const disconnect = useCallback(async () => {
    try {
      if (isBrowser && !wallet.isDemo) {
        const { solana } = window as any
        if (solana) {
          await solana.disconnect()
        }
      }
      setWallet((prev) => ({
        ...prev,
        publicKey: null,
        connected: false,
        isDemo: false,
      }))
    } catch (error) {
      console.error("Failed to disconnect Solana wallet:", error)
    }
  }, [wallet.isDemo])

  useEffect(() => {
    if (!isBrowser) return

    const { solana } = window as any
    if (solana?.isPhantom) {
      const handleConnect = () => {
        if (solana.publicKey) {
          setWallet((prev) => ({
            ...prev,
            publicKey: new PublicKey(solana.publicKey.toString()),
            connected: true,
            isDemo: false,
          }))
        }
      }

      const handleDisconnect = () => {
        setWallet((prev) => ({
          ...prev,
          publicKey: null,
          connected: false,
          isDemo: false,
        }))
      }

      solana.on("connect", handleConnect)
      solana.on("disconnect", handleDisconnect)

      // Auto-connect if previously connected
      if (solana.isConnected) {
        setWallet((prev) => ({
          ...prev,
          publicKey: new PublicKey(solana.publicKey.toString()),
          connected: true,
          isDemo: false,
        }))
      }

      return () => {
        if (solana.removeListener) {
          solana.removeListener("connect", handleConnect)
          solana.removeListener("disconnect", handleDisconnect)
        }
      }
    }
  }, [])

  return { wallet, connecting, connect, disconnect }
}

export function useEthereumWallet() {
  const [wallet, setWallet] = useState<EthereumWallet>({
    address: null,
    connected: false,
    provider: null,
    signer: null,
    connect: async () => {},
    disconnect: async () => {},
    chainId: null,
    isDemo: false,
  })
  const [connecting, setConnecting] = useState(false)

  const connectDemo = useCallback(async () => {
    const demoAddress = generateDemoEthAddress()

    setWallet({
      address: demoAddress,
      connected: true,
      provider: null, // Demo mode - no real provider
      signer: null, // Demo mode - no real signer
      connect: connectDemo,
      disconnect,
      chainId: 1, // Demo Ethereum mainnet
      isDemo: true,
    })
  }, [])

  const connect = useCallback(async () => {
    if (connecting) return
    setConnecting(true)

    try {
      // Check if we're in browser environment
      if (!isBrowser) {
        throw new Error("Wallet connection is only available in browser environment")
      }

      // Check if MetaMask is available
      if (!isMetaMaskAvailable()) {
        // Instead of throwing an error, connect in demo mode
        console.log("MetaMask not found, connecting in demo mode")
        await connectDemo()
        return
      }

      const ethereum = (window as any).ethereum

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask and try again.")
      }

      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setWallet({
        address,
        connected: true,
        provider,
        signer,
        connect,
        disconnect,
        chainId: Number(network.chainId),
        isDemo: false,
      })
    } catch (error: any) {
      console.error("Failed to connect Ethereum wallet:", error)

      // Provide more specific error messages for real wallet errors
      if (error.code === 4001) {
        throw new Error("Connection rejected. Please approve the connection request in MetaMask.")
      } else if (error.code === -32002) {
        throw new Error("Connection request pending. Please check MetaMask for a pending connection request.")
      } else if (error.message?.includes("User rejected")) {
        throw new Error("Connection rejected by user. Please try again and approve the connection.")
      }

      // If connection fails and not already in demo mode, try demo mode as fallback
      if (!wallet.isDemo) {
        console.log("Falling back to demo mode")
        await connectDemo()
        return
      }

      throw error
    } finally {
      setConnecting(false)
    }
  }, [connecting, connectDemo, wallet.isDemo])

  const disconnect = useCallback(async () => {
    setWallet((prev) => ({
      ...prev,
      address: null,
      connected: false,
      provider: null,
      signer: null,
      chainId: null,
      isDemo: false,
    }))
  }, [])

  useEffect(() => {
    if (!isBrowser) return

    const ethereum = (window as any).ethereum
    if (ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          // Reconnect with new account
          connect().catch(console.error)
        }
      }

      // Handle chain changes
      const handleChainChanged = (chainId: string) => {
        setWallet((prev) => ({
          ...prev,
          chainId: Number.parseInt(chainId, 16),
        }))
      }

      ethereum.on("accountsChanged", handleAccountsChanged)
      ethereum.on("chainChanged", handleChainChanged)

      // Auto-connect if previously connected
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connect().catch(console.error)
          }
        })
        .catch(console.error)

      // Cleanup event listeners
      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged)
          ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [connect, disconnect])

  return { wallet, connecting, connect, disconnect }
}

// Type declarations for window objects
declare global {
  interface Window {
    ethereum?: any
    solana?: any
  }
}
