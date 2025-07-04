import { ethers } from "hardhat"
import fs from "fs"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)))

  // LayerZero V2 Ethereum Mainnet endpoint
  const LAYERZERO_ENDPOINT = "0x1a44076050125825900e736c501f859c50fe728c"

  // Deploy ReclaimXOFT first
  console.log("\nDeploying ReclaimXOFT...")
  const ReclaimXOFT = await ethers.getContractFactory("ReclaimXOFT")
  const reclaimXOFT = await ReclaimXOFT.deploy("ReclaimX OFT", "RXOFT", LAYERZERO_ENDPOINT, deployer.address)
  await reclaimXOFT.waitForDeployment()
  const oftAddress = await reclaimXOFT.getAddress()
  console.log("ReclaimXOFT deployed to:", oftAddress)

  // Deploy RecoveryInitiator
  console.log("\nDeploying RecoveryInitiator...")
  const RecoveryInitiator = await ethers.getContractFactory("RecoveryInitiator")
  const recoveryInitiator = await RecoveryInitiator.deploy(LAYERZERO_ENDPOINT, deployer.address, oftAddress)
  await recoveryInitiator.waitForDeployment()
  const recoveryAddress = await recoveryInitiator.getAddress()
  console.log("RecoveryInitiator deployed to:", recoveryAddress)

  // Authorize RecoveryInitiator to slash tokens
  console.log("\nAuthorizing RecoveryInitiator as slasher...")
  await reclaimXOFT.authorizeSlasher(recoveryAddress, true)
  console.log("RecoveryInitiator authorized as slasher")

  // Save deployment addresses
  const deploymentInfo = {
    network: "ethereum-mainnet",
    chainId: 1,
    layerZeroEndpoint: LAYERZERO_ENDPOINT,
    layerZeroEid: 30101,
    contracts: {
      ReclaimXOFT: oftAddress,
      RecoveryInitiator: recoveryAddress,
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    gasUsed: {
      ReclaimXOFT: "Check transaction receipt",
      RecoveryInitiator: "Check transaction receipt",
    },
  }

  fs.writeFileSync("deployment-ethereum.json", JSON.stringify(deploymentInfo, null, 2))
  console.log("\nDeployment info saved to deployment-ethereum.json")

  // Verification commands
  console.log("\n=== Verification Commands ===")
  console.log(
    `npx hardhat verify --network mainnet ${oftAddress} "ReclaimX OFT" "RXOFT" "${LAYERZERO_ENDPOINT}" "${deployer.address}"`,
  )
  console.log(
    `npx hardhat verify --network mainnet ${recoveryAddress} "${LAYERZERO_ENDPOINT}" "${deployer.address}" "${oftAddress}"`,
  )

  // Next steps
  console.log("\n=== Next Steps ===")
  console.log("1. Update frontend App.tsx with deployed addresses:")
  console.log(`   RECOVERY_INITIATOR_ADDRESS = "${recoveryAddress}"`)
  console.log(`   RECLAIMX_OFT_ADDRESS = "${oftAddress}"`)
  console.log("2. Configure LayerZero peers after Solana deployment")
  console.log("3. Set up DVNs using LayerZero CLI")
  console.log("4. Test cross-chain functionality")

  return {
    reclaimXOFT: oftAddress,
    recoveryInitiator: recoveryAddress,
  }
}

main()
  .then((addresses) => {
    console.log("\n✅ EVM deployment completed successfully!")
    console.log("Addresses:", addresses)
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
