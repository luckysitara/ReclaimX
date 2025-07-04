"use client"

import { useState, useEffect, useMemo } from "react"
import { ethers } from "ethers"
import { Connection } from "@solana/web3.js"
import { type Program, AnchorProvider } from "@project-serum/anchor"
import { RECOVERY_INITIATOR_ABI, RECLAIMX_OFT_ABI } from "../constants/abis"
import { useEthereumWallet, useSolanaWallet } from "./use-wallet"

// Contract addresses - update these after deployment
const RECOVERY_INITIATOR_ADDRESS =
  process.env.REACT_APP_RECOVERY_INITIATOR_ADDRESS || "0x1234567890abcdef1234567890abcdef12345678"
const RECLAIMX_OFT_ADDRESS = process.env.REACT_APP_RECLAIMX_OFT_ADDRESS || "0xabcdef1234567890abcdef1234567890abcdef12"
const RECLAIMX_VAULT_PROGRAM_ID =
  process.env.REACT_APP_RECLAIMX_VAULT_PROGRAM_ID || "ReclaimXVault1234567890abcdef1234567890"

// Network configurations
const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || "https://api.devnet.solana.com"
const ETHEREUM_RPC_URL = process.env.REACT_APP_ETHEREUM_RPC_URL || "https://rpc.ankr.com/eth"

export function useEthereumContracts() {
  const { wallet } = useEthereumWallet()
  const [recoveryContract, setRecoveryContract] = useState<ethers.Contract | null>(null)
  const [oftContract, setOftContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    if (wallet.signer) {
      try {
        const recovery = new ethers.Contract(RECOVERY_INITIATOR_ADDRESS, RECOVERY_INITIATOR_ABI, wallet.signer)

        const oft = new ethers.Contract(RECLAIMX_OFT_ADDRESS, RECLAIMX_OFT_ABI, wallet.signer)

        setRecoveryContract(recovery)
        setOftContract(oft)
      } catch (error) {
        console.error("Failed to initialize contracts:", error)
      }
    } else {
      setRecoveryContract(null)
      setOftContract(null)
    }
  }, [wallet.signer])

  return {
    recoveryContract,
    oftContract,
    connected: wallet.connected,
    address: wallet.address,
    chainId: wallet.chainId,
  }
}

export function useSolanaProgram() {
  const { wallet } = useSolanaWallet()
  const [program, setProgram] = useState<Program | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [vaultService, setVaultService] = useState<any>(null)

  useEffect(() => {
    const conn = new Connection(SOLANA_RPC_URL, "confirmed")
    setConnection(conn)

    if (wallet.connected && wallet.publicKey) {
      try {
        // Create a mock wallet for AnchorProvider
        const anchorWallet = {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        }

        const provider = new AnchorProvider(conn, anchorWallet as any, { commitment: "confirmed" })

        // Note: In production, you would load the actual IDL and create the program
        // const program = new Program(idl, RECLAIMX_VAULT_PROGRAM_ID, provider)
        // setProgram(program)

        // For now, we'll create a mock service using the functional approach
        // const service = createSolanaVaultService(program, conn, anchorWallet)
        // setVaultService(service)

        console.log("Solana program initialized")
      } catch (error) {
        console.error("Failed to initialize Solana program:", error)
      }
    } else {
      setProgram(null)
      setVaultService(null)
    }
  }, [wallet.connected, wallet.publicKey])

  return {
    program,
    connection,
    vaultService,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  }
}

export function useTokenBalances() {
  const { oftContract, connected: ethConnected, address } = useEthereumContracts()
  const [tokenBalance, setTokenBalance] = useState<string>("0")
  const [stakedBalance, setStakedBalance] = useState<string>("0")
  const [loading, setLoading] = useState(false)

  const fetchBalances = useMemo(
    () => async () => {
      if (!oftContract || !ethConnected || !address) return

      setLoading(true)
      try {
        const [balance, staked] = await Promise.all([
          oftContract.balanceOf(address),
          oftContract.getStakedBalance(address),
        ])

        setTokenBalance(ethers.formatEther(balance))
        setStakedBalance(ethers.formatEther(staked))
      } catch (error) {
        console.error("Failed to fetch balances:", error)
      } finally {
        setLoading(false)
      }
    },
    [oftContract, ethConnected, address],
  )

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    tokenBalance,
    stakedBalance,
    loading,
    refetch: fetchBalances,
  }
}
