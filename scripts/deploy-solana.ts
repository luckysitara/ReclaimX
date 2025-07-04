import { Connection, Keypair } from "@solana/web3.js"
import fs from "fs"
import os from "os"
import path from "path"

async function main() {
  console.log("🚀 Starting ReclaimX Solana deployment with LayerZero V2...")

  // Connect to Solana Devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed")
  console.log("Connected to Solana Devnet")

  // Load wallet from default Solana CLI location
  const walletPath = path.join(os.homedir(), ".config", "solana", "id.json")
  let wallet: Keypair

  try {
    const walletData = JSON.parse(fs.readFileSync(walletPath, "utf8"))
    wallet = Keypair.fromSecretKey(Uint8Array.from(walletData))
    console.log("Loaded wallet from:", walletPath)
    console.log("Wallet public key:", wallet.publicKey.toBase58())
  } catch (error) {
    console.error("Failed to load wallet from", walletPath)
    console.error("Please ensure you have a Solana wallet at the default location")
    console.error("Run: solana-keygen new -o ~/.config/solana/id.json")
    process.exit(1)
  }

  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey)
  console.log("Wallet balance:", balance / 1e9, "SOL")

  if (balance < 1e9) {
    console.log("⚠️  Low balance detected. Request SOL from faucet:")
    console.log("https://faucet.solana.com/")
    console.log("Or run: solana airdrop 2")
  }

  // LayerZero V2 Solana Devnet endpoint (official address)
  const LAYERZERO_ENDPOINT = "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"

  const deploymentInfo = {
    network: "solana-devnet",
    cluster: "devnet",
    layerZeroEndpoint: LAYERZERO_ENDPOINT,
    layerZeroEid: 40168,
    wallet: wallet.publicKey.toBase58(),
    deployedAt: new Date().toISOString(),
    instructions: {
      setup: [
        "1. Clone LayerZero devtools repository",
        "2. Build and deploy OFT program first",
        "3. Build and deploy ReclaimX program",
        "4. Configure peers and DVNs",
        "5. Test cross-chain functionality",
      ],
      commands: {
        cloneDevtools: "git clone https://github.com/LayerZero-Labs/devtools.git",
        buildOFT: "cd devtools/examples/oft-solana && anchor build",
        deployOFT: "cd devtools/examples/oft-solana && anchor deploy --provider.cluster devnet",
        buildReclaimX: "cd programs/reclaimx && anchor build",
        deployReclaimX: "anchor deploy --provider.cluster devnet",
        verify: "solana-verify run -p ./programs/reclaimx -l <PROGRAM_ID>",
      },
    },
    placeholders: {
      programId: "YourDeployedReclaimXVaultProgramId",
      oftProgramId: "YourDeployedOFTProgramID",
    },
    dependencies: {
      "oapp-solana-sdk": "LayerZero OApp SDK for Solana",
      "oft-solana-sdk": "LayerZero OFT SDK for Solana",
      "anchor-lang": "Solana Anchor framework",
    },
  }

  fs.writeFileSync("deployment-solana.json", JSON.stringify(deploymentInfo, null, 2))
  console.log("Deployment info saved to deployment-solana.json")

  console.log("\n=== LayerZero V2 Solana Deployment Guide ===")
  console.log("\n📋 Prerequisites:")
  console.log("   ✓ Solana CLI installed and configured")
  console.log("   ✓ Anchor CLI v0.30.0+ installed")
  console.log("   ✓ Rust toolchain installed")
  console.log("   ✓ Sufficient SOL balance for deployment")

  console.log("\n🔧 Step 1: Clone LayerZero DevTools")
  console.log("   git clone https://github.com/LayerZero-Labs/devtools.git")
  console.log("   cd devtools")

  console.log("\n🏗️  Step 2: Deploy LayerZero OFT Program")
  console.log("   cd examples/oft-solana")
  console.log("   anchor build")
  console.log("   anchor deploy --provider.cluster devnet")
  console.log("   # Note the deployed program ID")

  console.log("\n🏗️  Step 3: Deploy ReclaimX Program")
  console.log("   cd ../../../programs/reclaimx")
  console.log("   # Update Cargo.toml with LayerZero SDK dependencies")
  console.log("   anchor build")
  console.log("   anchor deploy --provider.cluster devnet")

  console.log("\n📝 Step 4: Update Configuration")
  console.log("   1. Update lib.rs with deployed program ID:")
  console.log('      declare_id!("<YOUR_PROGRAM_ID>");')
  console.log("   2. Update Anchor.toml:")
  console.log("      [programs.devnet]")
  console.log('      reclaimx = "<YOUR_PROGRAM_ID>"')
  console.log("   3. Update frontend App.tsx:")
  console.log('      RECLAIMX_VAULT_PROGRAM = "<YOUR_PROGRAM_ID>"')
  console.log('      OFT_PROGRAM = "<OFT_PROGRAM_ID>"')

  console.log("\n🔗 Step 5: Configure LayerZero Peers")
  console.log("   1. Set EVM peer address in Solana program")
  console.log("   2. Call setPeer on EVM RecoveryInitiator contract")
  console.log("   3. Configure DVNs for secure messaging")

  console.log("\n🧪 Step 6: Test Integration")
  console.log("   anchor test")
  console.log("   # Test cross-chain messaging")
  console.log("   # Verify on LayerZero Scan")

  console.log("\n📚 Resources:")
  console.log("   • LayerZero V2 Docs: https://docs.layerzero.network/v2/")
  console.log("   • Solana OApp Example: https://github.com/LayerZero-Labs/devtools/tree/main/examples/oapp-solana")
  console.log("   • Solana OFT Example: https://github.com/LayerZero-Labs/devtools/tree/main/examples/oft-solana")
  console.log("   • LayerZero Scan: https://layerzeroscan.com/")

  console.log("\n⚠️  Important Notes:")
  console.log("   • Use official LayerZero Solana SDK from devtools repo")
  console.log("   • Configure at least 2 DVNs for production security")
  console.log("   • Test thoroughly on devnet before mainnet deployment")
  console.log("   • Monitor cross-chain messages via LayerZero Scan")

  return {
    wallet: wallet.publicKey.toBase58(),
    endpoint: LAYERZERO_ENDPOINT,
    cluster: "devnet",
    eid: 40168,
  }
}

main()
  .then((info) => {
    console.log("\n✅ Solana deployment preparation completed!")
    console.log("Deployment info:", info)
    console.log("\n📝 Follow the step-by-step guide above to complete deployment")
    console.log("🎯 Ready for LayerZero V2 cross-chain integration!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Deployment preparation failed:", error)
    process.exit(1)
  })
