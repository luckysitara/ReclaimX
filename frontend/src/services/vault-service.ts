import { ethers } from "ethers"

export interface VaultConfig {
  guardians: string[]
  threshold: number
  timelock: number
  inactivityPeriod: number
  backupWallet: string
  stakeAmount: string
  assets: Asset[]
}

export interface Asset {
  assetType: "Token" | "NFT"
  amount: string
  tokenAddress: string
}

export interface VaultInfo {
  id: string
  owner: string
  guardians: string[]
  threshold: number
  timelock: number
  inactivityPeriod: number
  backupWallet: string
  stakeAmount: string
  recoveryState: number
  recoveryId: number
  lastActiveTimestamp: number
}

export interface RecoveryInfo {
  newOwner: string
  approvals: string[]
  maliciousApprovals: string[]
  startTimestamp: number
  completed: boolean
}

// Use a functional approach instead of class to avoid constructor issues
export const createVaultService = (recoveryContract: ethers.Contract, oftContract: ethers.Contract) => {
  return {
    async createVault(config: VaultConfig): Promise<string> {
      try {
        // Validate inputs
        if (config.guardians.length < config.threshold) {
          throw new Error("Threshold cannot be greater than number of guardians")
        }

        if (config.threshold === 0) {
          throw new Error("Threshold must be greater than 0")
        }

        // Convert assets to contract format
        const assets = config.assets.map((asset) => ({
          assetType: asset.assetType === "Token" ? 0 : 1,
          amount: ethers.parseEther(asset.amount),
          tokenAddress: asset.tokenAddress,
        }))

        // Call contract
        const tx = await recoveryContract.initializeVault(
          config.guardians,
          config.threshold,
          config.timelock,
          config.inactivityPeriod,
          config.backupWallet,
          ethers.parseEther(config.stakeAmount),
          assets,
        )

        const receipt = await tx.wait()

        // Extract vault ID from events
        const vaultInitializedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = recoveryContract.interface.parseLog(log)
            return parsed?.name === "VaultInitialized"
          } catch {
            return false
          }
        })

        if (vaultInitializedEvent) {
          const parsed = recoveryContract.interface.parseLog(vaultInitializedEvent)
          return parsed?.args?.vaultId || tx.hash
        }

        return tx.hash
      } catch (error: any) {
        console.error("Failed to create vault:", error)
        throw new Error(`Failed to create vault: ${error.message}`)
      }
    },

    async getVaultInfo(vaultId: string): Promise<VaultInfo | null> {
      try {
        const vaultData = await recoveryContract.getVault(vaultId)

        return {
          id: vaultId,
          owner: vaultData[0],
          guardians: vaultData[1],
          threshold: vaultData[2],
          timelock: Number(vaultData[3]),
          inactivityPeriod: Number(vaultData[4]),
          backupWallet: vaultData[5],
          stakeAmount: ethers.formatEther(vaultData[6]),
          recoveryState: vaultData[7],
          recoveryId: Number(vaultData[8]),
          lastActiveTimestamp: Number(vaultData[9]),
        }
      } catch (error) {
        console.error("Failed to get vault info:", error)
        return null
      }
    },

    async initiateRecovery(
      vaultId: string,
      newOwner: string,
      dstEid = 40168, // Solana EID
      options = "0x",
    ): Promise<string> {
      try {
        // Get quote for cross-chain message
        const message = ethers.AbiCoder.defaultAbiCoder().encode(
          ["tuple(bytes32 vaultId, address newOwner, uint64 recoveryId, uint8 action)"],
          [[vaultId, newOwner, 1, 0]], // action 0 = initiate
        )

        const fee = await recoveryContract.quote(dstEid, message, options, false)

        const tx = await recoveryContract.initiateRecovery(vaultId, newOwner, dstEid, options, {
          value: fee.nativeFee,
        })

        await tx.wait()
        return tx.hash
      } catch (error: any) {
        console.error("Failed to initiate recovery:", error)
        throw new Error(`Failed to initiate recovery: ${error.message}`)
      }
    },

    async approveRecovery(vaultId: string, recoveryId: number): Promise<string> {
      try {
        const tx = await recoveryContract.approveRecovery(vaultId, recoveryId)
        await tx.wait()
        return tx.hash
      } catch (error: any) {
        console.error("Failed to approve recovery:", error)
        throw new Error(`Failed to approve recovery: ${error.message}`)
      }
    },

    async getRecoveryInfo(vaultId: string, recoveryId: number): Promise<RecoveryInfo | null> {
      try {
        const recoveryData = await recoveryContract.getRecovery(vaultId, recoveryId)

        return {
          newOwner: recoveryData[0],
          approvals: recoveryData[1],
          maliciousApprovals: recoveryData[2],
          startTimestamp: Number(recoveryData[3]),
          completed: recoveryData[4],
        }
      } catch (error) {
        console.error("Failed to get recovery info:", error)
        return null
      }
    },

    async stakeTokens(amount: string): Promise<string> {
      try {
        const amountWei = ethers.parseEther(amount)

        // First approve the contract to spend tokens
        const approveTx = await oftContract.approve(await recoveryContract.getAddress(), amountWei)
        await approveTx.wait()

        // Then stake the tokens
        const stakeTx = await oftContract.stake(amountWei)
        await stakeTx.wait()

        return stakeTx.hash
      } catch (error: any) {
        console.error("Failed to stake tokens:", error)
        throw new Error(`Failed to stake tokens: ${error.message}`)
      }
    },

    async unstakeTokens(amount: string): Promise<string> {
      try {
        const amountWei = ethers.parseEther(amount)
        const tx = await oftContract.unstake(amountWei)
        await tx.wait()
        return tx.hash
      } catch (error: any) {
        console.error("Failed to unstake tokens:", error)
        throw new Error(`Failed to unstake tokens: ${error.message}`)
      }
    },

    async markMalicious(vaultId: string, recoveryId: number, guardian: string): Promise<string> {
      try {
        const tx = await recoveryContract.markMalicious(vaultId, recoveryId, guardian)
        await tx.wait()
        return tx.hash
      } catch (error: any) {
        console.error("Failed to mark malicious:", error)
        throw new Error(`Failed to mark malicious: ${error.message}`)
      }
    },

    async updateLastActive(vaultId: string): Promise<string> {
      try {
        const tx = await recoveryContract.updateLastActive(vaultId)
        await tx.wait()
        return tx.hash
      } catch (error: any) {
        console.error("Failed to update last active:", error)
        throw new Error(`Failed to update last active: ${error.message}`)
      }
    },

    async checkInactivity(vaultId: string): Promise<string> {
      try {
        const tx = await recoveryContract.checkInactivity(vaultId)
        await tx.wait()
        return tx.hash
      } catch (error: any) {
        console.error("Failed to check inactivity:", error)
        throw new Error(`Failed to check inactivity: ${error.message}`)
      }
    },
  }
}

// Type for the service
export type VaultService = ReturnType<typeof createVaultService>
