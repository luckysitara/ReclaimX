import { type Connection, PublicKey, SystemProgram } from "@solana/web3.js"
import { type Program, BN } from "@project-serum/anchor"

export interface SolanaVaultConfig {
  guardians: PublicKey[]
  threshold: number
  timelock: number
  inactivityPeriod: number
  backupWallet: PublicKey
  stakeAmount: number
  assets: SolanaAsset[]
}

export interface SolanaAsset {
  assetType: "Token" | "NFT"
  amount: number
  tokenAccount: PublicKey
  mint: PublicKey
}

// Use a functional approach instead of class to avoid constructor issues
export const createSolanaVaultService = (program: Program, connection: Connection, wallet: any) => {
  return {
    async createVault(config: SolanaVaultConfig): Promise<string> {
      try {
        // Generate vault PDA
        const [vaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), wallet.publicKey.toBuffer()],
          program.programId,
        )

        // Create instruction
        const tx = await program.methods
          .initializeVault(
            config.guardians,
            config.threshold,
            new BN(config.timelock),
            new BN(config.inactivityPeriod),
            config.backupWallet,
            new BN(config.stakeAmount),
            config.assets,
          )
          .accounts({
            vault: vaultPda,
            owner: wallet.publicKey,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        return tx
      } catch (error: any) {
        console.error("Failed to create Solana vault:", error)
        throw new Error(`Failed to create Solana vault: ${error.message}`)
      }
    },

    async initiateRecovery(
      vaultId: PublicKey,
      newOwner: PublicKey,
      dstEid = 30101, // Ethereum EID
    ): Promise<string> {
      try {
        const tx = await program.methods
          .initiateRecovery(newOwner, dstEid, [])
          .accounts({
            vault: vaultId,
            initiator: wallet.publicKey,
            payer: wallet.publicKey,
          })
          .rpc()

        return tx
      } catch (error: any) {
        console.error("Failed to initiate Solana recovery:", error)
        throw new Error(`Failed to initiate Solana recovery: ${error.message}`)
      }
    },

    async approveRecovery(vaultId: PublicKey): Promise<string> {
      try {
        const tx = await program.methods
          .approveRecovery()
          .accounts({
            vault: vaultId,
            guardian: wallet.publicKey,
          })
          .rpc()

        return tx
      } catch (error: any) {
        console.error("Failed to approve Solana recovery:", error)
        throw new Error(`Failed to approve Solana recovery: ${error.message}`)
      }
    },

    async stakeGuardianOft(vaultId: PublicKey, amount: number, dstEid = 30101): Promise<string> {
      try {
        const tx = await program.methods
          .stakeGuardianOft(new BN(amount), dstEid, [])
          .accounts({
            vault: vaultId,
            guardian: wallet.publicKey,
          })
          .rpc()

        return tx
      } catch (error: any) {
        console.error("Failed to stake guardian OFT:", error)
        throw new Error(`Failed to stake guardian OFT: ${error.message}`)
      }
    },

    async markMalicious(vaultId: PublicKey, guardian: PublicKey): Promise<string> {
      try {
        const tx = await program.methods
          .markMalicious(guardian)
          .accounts({
            vault: vaultId,
            signer: wallet.publicKey,
          })
          .rpc()

        return tx
      } catch (error: any) {
        console.error("Failed to mark malicious on Solana:", error)
        throw new Error(`Failed to mark malicious on Solana: ${error.message}`)
      }
    },

    async updateLastActive(vaultId: PublicKey): Promise<string> {
      try {
        const tx = await program.methods
          .updateLastActive()
          .accounts({
            vault: vaultId,
            owner: wallet.publicKey,
          })
          .rpc()

        return tx
      } catch (error: any) {
        console.error("Failed to update last active on Solana:", error)
        throw new Error(`Failed to update last active on Solana: ${error.message}`)
      }
    },

    async getVaultInfo(vaultId: PublicKey): Promise<any> {
      try {
        const vaultAccount = await program.account.vault.fetch(vaultId)
        return vaultAccount
      } catch (error) {
        console.error("Failed to get Solana vault info:", error)
        return null
      }
    },
  }
}

// Type for the service
export type SolanaVaultService = ReturnType<typeof createSolanaVaultService>
