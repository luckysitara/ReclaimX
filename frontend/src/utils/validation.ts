import { ethers } from "ethers"
import { PublicKey } from "@solana/web3.js"

export function isValidEthereumAddress(address: string): boolean {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export function validateVaultConfig(config: {
  guardians: string[]
  threshold: number
  timelock: number
  inactivityPeriod: number
  backupWallet: string
  stakeAmount: string
}): string[] {
  const errors: string[] = []

  // Validate guardians
  if (config.guardians.length === 0) {
    errors.push("At least one guardian is required")
  }

  config.guardians.forEach((guardian, index) => {
    if (!isValidEthereumAddress(guardian)) {
      errors.push(`Guardian ${index + 1} has invalid address`)
    }
  })

  // Check for duplicate guardians
  const uniqueGuardians = new Set(config.guardians)
  if (uniqueGuardians.size !== config.guardians.length) {
    errors.push("Duplicate guardian addresses are not allowed")
  }

  // Validate threshold
  if (config.threshold <= 0) {
    errors.push("Threshold must be greater than 0")
  }

  if (config.threshold > config.guardians.length) {
    errors.push("Threshold cannot be greater than number of guardians")
  }

  // Validate timelock
  if (config.timelock < 0) {
    errors.push("Timelock cannot be negative")
  }

  // Validate inactivity period
  if (config.inactivityPeriod <= 0) {
    errors.push("Inactivity period must be greater than 0")
  }

  // Validate backup wallet
  if (!isValidEthereumAddress(config.backupWallet)) {
    errors.push("Invalid backup wallet address")
  }

  // Validate stake amount
  try {
    const amount = Number.parseFloat(config.stakeAmount)
    if (amount <= 0) {
      errors.push("Stake amount must be greater than 0")
    }
  } catch {
    errors.push("Invalid stake amount")
  }

  return errors
}

export function formatAddress(address: string, length = 6): string {
  if (!address) return ""
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

export function formatTokenAmount(amount: string, decimals = 18): string {
  try {
    const num = Number.parseFloat(amount)
    if (num === 0) return "0"
    if (num < 0.001) return "< 0.001"
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
  } catch {
    return "0"
  }
}

export function getExplorerUrl(txHash: string, chainId: number): string {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return `https://etherscan.io/tx/${txHash}`
    case 11155111: // Sepolia
      return `https://sepolia.etherscan.io/tx/${txHash}`
    case 137: // Polygon
      return `https://polygonscan.com/tx/${txHash}`
    case 42161: // Arbitrum
      return `https://arbiscan.io/tx/${txHash}`
    default:
      return `https://etherscan.io/tx/${txHash}`
  }
}

export function getSolanaExplorerUrl(txHash: string, cluster = "devnet"): string {
  return `https://explorer.solana.com/tx/${txHash}?cluster=${cluster}`
}

export function getLayerZeroScanUrl(txHash: string): string {
  return `https://layerzeroscan.com/tx/${txHash}`
}
