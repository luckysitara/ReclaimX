# LayerZero V2 Official Endpoints

## Mainnet Endpoints

### Ethereum Mainnet
- **Chain ID**: 1
- **LayerZero EID**: 30101
- **Endpoint**: `0x1a44076050125825900e736c501f859c50fe728c`

### Arbitrum One
- **Chain ID**: 42161
- **LayerZero EID**: 30110
- **Endpoint**: `0x1a44076050125825900e736c501f859c50fe728c`

### Polygon
- **Chain ID**: 137
- **LayerZero EID**: 30109
- **Endpoint**: `0x1a44076050125825900e736c501f859c50fe728c`

### Solana Mainnet
- **LayerZero EID**: 30168
- **Endpoint**: `H3SKp4cL5rpzJDntDa2umKE9AHkGiyss1W8BNDndhHWp`

## Testnet Endpoints

### Sepolia Testnet
- **Chain ID**: 11155111
- **LayerZero EID**: 40161
- **Endpoint**: `0x6EDCE65403992e310A62460808c4b910D972f10f`

### Solana Devnet
- **LayerZero EID**: 40168
- **Endpoint**: `76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6`

## Resources

- **Official Deployed Contracts**: https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
- **LayerZero Scan**: https://layerzeroscan.com/
- **Solana Developer Docs**: https://docs.layerzero.network/v2/developers/solana/overview

## Usage in ReclaimX

\`\`\`typescript
// For production deployment
const ETHEREUM_MAINNET_ENDPOINT = "0x1a44076050125825900e736c501f859c50fe728c"
const SOLANA_MAINNET_ENDPOINT = "H3SKp4cL5rpzJDntDa2umKE9AHkGiyss1W8BNDndhHWp"

// For testing
const SEPOLIA_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f"
const SOLANA_DEVNET_ENDPOINT = "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"
\`\`\`

## Network Configuration

\`\`\`javascript
// hardhat.config.js
networks: {
  mainnet: {
    url: process.env.ETHEREUM_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 1,
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111,
  },
}
\`\`\`
\`\`\`

```typescriptreact file="README.md"
[v0-no-op-code-block-prefix]# ReclaimX - Cross-Chain Wallet Recovery and Inheritance Protocol

ReclaimX is a production-ready, decentralized, cross-chain wallet recovery and inheritance protocol built on **Solana Devnet** and **Ethereum Mainnet**, leveraging **LayerZero V2** for omnichain interoperability. It enables users to create guardian-based vaults for wallet recovery, supports inheritance via inactivity periods, enforces guardian staking with RXOFT tokens, and includes slashing for malicious guardians.

## 🌟 Features

- **Guardian Vault Management**: Create vaults with guardians, threshold, timelock, inactivity period, backup wallet, stake amount, and asset tracking (tokens/NFTs)
- **Cross-Chain Recovery**: Initiate and approve recovery across Solana and Ethereum using **LayerZero V2 OApp**
- **Inheritance**: Automatically trigger recovery to a backup wallet after inactivity
- **Guardian Staking**: Guardians stake RXOFT tokens via **LayerZero V2 OFT**
- **Guardian Slashing**: Penalize malicious guardians (3+ approvals) by burning staked tokens
- **Vault State Synchronization**: Sync vault state across chains via LayerZero OApp
- **Asset Transfers**: Transfer tokens and NFTs post-recovery using OFT
- **Decentralized Verifier Networks (DVNs)**: Secure messaging with configurable DVNs
- **Professional Frontend**: React with shadcn/ui for intuitive vault management
- **Comprehensive Testing**: Full test suite covering all features

## 🏗️ Architecture

### LayerZero V2 Integration (Official Endpoints)
- **Solana Devnet**: EID 40168, Endpoint: `76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6`
- **Ethereum Mainnet**: EID 30101, Endpoint: `0x1a44076050125825900e736c501f859c50fe728c`
- **Sepolia Testnet**: EID 40161, Endpoint: `0x6EDCE65403992e310A62460808c4b910D972f10f` (for testing)

### Components
1. **Solana Program** (`programs/reclaimx/src/lib.rs`): OApp using official LayerZero Solana SDK
2. **EVM Contracts**: 
   - `RecoveryInitiator.sol`: OApp for cross-chain recovery
   - `ReclaimXOFT.sol`: OFT for RXOFT token staking/slashing
3. **Frontend**: React TypeScript with enhanced UI and LayerZero monitoring
4. **Tests**: Comprehensive test suite with cross-chain integration

## 📋 Prerequisites

### Development Environment
- **Node.js**: v18.x or higher
- **Yarn**: Optional, for frontend dependency management
- **Rust**: v1.60 or higher
- **Solana CLI**: v1.18.x or higher
- **Anchor CLI**: v0.30.x or higher
- **Hardhat**: v2.22.x or higher
- **Docker**: For `solana-verify`
- **Git**: For cloning repositories

### Wallets & Funds
- **Solana Wallet**: Phantom or CLI wallet with testnet SOL ([Faucet](https://faucet.solana.com/))
- **EVM Wallet**: MetaMask or Hardhat wallet with Mainnet ETH (use test account)

### Official Resources
- **LayerZero V2 Docs**: [https://docs.layerzero.network/v2/](https://docs.layerzero.network/v2/)
- **Deployed Contracts**: [https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts](https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts)
- **Solana Developer Guide**: [https://docs.layerzero.network/v2/developers/solana/overview](https://docs.layerzero.network/v2/developers/solana/overview)
- **LayerZero Scan**: [https://layerzeroscan.com/](https://layerzeroscan.com/)
- **Solana OApp Example**: [https://github.com/LayerZero-Labs/devtools/tree/main/examples/oapp-solana](https://github.com/LayerZero-Labs/devtools/tree/main/examples/oapp-solana)
- **Solana OFT Example**: [https://github.com/LayerZero-Labs/devtools/tree/main/examples/oft-solana](https://github.com/LayerZero-Labs/devtools/tree/main/examples/oft-solana)

## 🚀 Installation

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/your-repo/reclaimx.git
cd reclaimx
\`\`\`

### 2. Set Up Solana Environment
\`\`\`bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup update

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana config set --url https://api.devnet.solana.com

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Create Solana Wallet (if not using Phantom)
solana-keygen new -o ~/.config/solana/id.json
solana airdrop 2
\`\`\`

### 3. Clone LayerZero DevTools
\`\`\`bash
# Clone official LayerZero repository
git clone https://github.com/LayerZero-Labs/devtools.git
cd devtools

# Explore Solana examples
ls examples/
# You'll see: oapp-solana, oft-solana, etc.
\`\`\`

### 4. Set Up EVM Environment
\`\`\`bash
# Install Node.js dependencies
npm install -g hardhat

# Install project dependencies
npm install
\`\`\`

### 5. Install Dependencies
\`\`\`bash
# Solana Program (with LayerZero SDK)
cd programs/reclaimx
# Cargo.toml already includes LayerZero SDK dependencies
cargo build-bpf
cd ../..

# EVM Contracts
npm install

# Frontend
cd frontend
npm install
cd ..
\`\`\`

## ⚙️ Configuration

### 1. Environment Variables

Create `.env` file in project root:
\`\`\`bash
# EVM Configuration
PRIVATE_KEY=your_wallet_private_key
ETHEREUM_RPC_URL=https://rpc.ankr.com/eth
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Use Sepolia for testing (cheaper)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
\`\`\`

### 2. LayerZero SDK Integration

The Solana program now uses the **official LayerZero Solana SDK**:

\`\`\`toml
# programs/reclaimx/Cargo.toml
[dependencies]
anchor-lang = "0.30.0"
anchor-spl = "0.30.0"
solana-program = "~1.18.0"

# Official LayerZero Solana SDK
oapp-solana-sdk = { git = "https://github.com/LayerZero-Labs/devtools.git", branch = "main", features = ["anchor"] }
oft-solana-sdk = { git = "https://github.com/LayerZero-Labs/devtools.git", branch = "main", features = ["anchor"] }
\`\`\`

### 3. Update Contract/Program IDs

After deployment, update these placeholders:

**Solana** (`lib.rs`, `App.tsx`):
- `YourDeployedReclaimXVaultProgramId`: Replace with deployed Solana program ID
- `YourDeployedOFTProgramID`: Replace with deployed OFT program ID

**EVM** (`App.tsx`):
- `YourDeployedRecoveryInitiatorAddress`: Replace with deployed `RecoveryInitiator.sol` address
- `YourDeployedReclaimXOFTAddress`: Replace with deployed `ReclaimXOFT.sol` address

## 🚢 Deployment

### 1. Deploy LayerZero OFT Program (Solana)

\`\`\`bash
# Navigate to LayerZero devtools
cd devtools/examples/oft-solana

# Build and deploy OFT program
anchor build
anchor deploy --provider.cluster devnet

# Note the program ID - you'll need this for ReclaimX
echo "OFT Program ID: <COPY_FROM_OUTPUT>"
\`\`\`

### 2. Deploy ReclaimX Program (Solana)

\`\`\`bash
# Return to ReclaimX project
cd ../../../programs/reclaimx

# Build program with LayerZero SDK
anchor build

# Deploy to Solana Devnet
anchor deploy --provider.cluster devnet

# Update configuration files with program ID
# - lib.rs: declare_id!("<YOUR_PROGRAM_ID>");
# - Anchor.toml: [programs.devnet] reclaimx = "<YOUR_PROGRAM_ID>"
# - App.tsx: RECLAIMX_VAULT_PROGRAM = "<YOUR_PROGRAM_ID>"
\`\`\`

### 3. Deploy EVM Contracts

\`\`\`bash
# Compile contracts
npx hardhat compile

# Deploy to Ethereum Mainnet
npx hardhat run scripts/deploy-evm.ts --network mainnet

# Or deploy to Sepolia for testing
npx hardhat run scripts/deploy-evm.ts --network sepolia

# Verify contracts
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
\`\`\`

### 4. Configure LayerZero Peers

After both deployments:

\`\`\`bash
# Set EVM peer in Solana program
# Call set_peer instruction with EVM contract address

# Set Solana peer in EVM contract
npx hardhat run --network mainnet scripts/set-peers.js
\`\`\`

### 5. Configure DVNs

\`\`\`bash
# Using LayerZero CLI (recommended)
npx hardhat lz:oapp:config:set --oapp-config layerzero.config.ts

# Or manually configure in contracts
# Use at least 2 DVNs for security
\`\`\`

## 🖥️ Running the Frontend

\`\`\`bash
cd frontend
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173)

### Enhanced Features
- **Tabbed Interface**: Organized vault management, recovery, staking, and monitoring
- **Real-time Updates**: Token balances, staked amounts, recovery status
- **LayerZero Integration**: Direct links to LayerZero Scan for transaction monitoring
- **Cross-chain Tracking**: Monitor cross-chain messages and their status
- **Guardian Management**: Mark malicious guardians, track approvals

## 🧪 Testing

\`\`\`bash
# Run comprehensive tests
npx hardhat test

# Run Solana program tests
anchor test

# Test cross-chain integration
npm run test:integration
\`\`\`

### Test Coverage
- Vault initialization (Solana/EVM)
- Cross-chain recovery with LayerZero V2
- Guardian staking via OFT
- Malicious guardian slashing
- Inactivity-based inheritance
- DVN configuration and security

## 🔍 Monitoring & Debugging

### LayerZero Scan
Monitor all cross-chain messages: [https://layerzeroscan.com/](https://layerzeroscan.com/)

### Solana Logs
\`\`\`bash
solana logs <PROGRAM_ID>
\`\`\`

### Ethereum Logs
Check transactions on [Etherscan](https://etherscan.io/)

### Frontend Monitoring
The enhanced frontend provides:
- Real-time transaction tracking
- Cross-chain message status
- LayerZero Scan integration
- Contract address management

## 🏆 Hackathon Submission

### 1. Public Repository
Push to public GitHub repository with:
- Complete codebase using official LayerZero SDK
- Enhanced deployment scripts
- Comprehensive documentation
- Professional frontend

### 2. Demo Deployment
\`\`\`bash
# Build and deploy frontend
cd frontend
npm run build
vercel --prod
\`\`\`

### 3. Video Demonstration
Record 5-7 minute video showing:
- Vault creation on both chains
- Cross-chain recovery process using LayerZero V2
- Guardian staking via OFT
- Malicious guardian slashing
- LayerZero Scan transaction verification
- Professional UI/UX

### 4. Feedback Submission
Submit detailed feedback at: [https://layerzeronetwork.typeform.com/builderFeedback](https://layerzeronetwork.typeform.com/builderFeedback)

Include insights on:
- LayerZero Solana SDK usability
- Cross-chain development experience
- Documentation quality
- Developer tools effectiveness

## 🔧 Troubleshooting

### Common Issues

**LayerZero SDK Issues**:
- Ensure you're using the latest devtools repository
- Check Cargo.toml dependencies are correctly specified
- Verify endpoint addresses match official deployments

**Solana Errors**:
- Request SOL from [faucet](https://faucet.solana.com/)
- Check program logs: `solana logs <PROGRAM_ID>`
- Verify LayerZero endpoint is accessible

**EVM Errors**:
- Ensure sufficient ETH balance
- Verify contract ABIs match deployed contracts
- Check LayerZero endpoint configuration

**Cross-Chain Issues**:
- Monitor LayerZero Scan for message status
- Verify peer configurations on both chains
- Check DVN setup and configuration
- Ensure proper gas/fee estimation

## 📚 Resources

### Official LayerZero Resources
- **LayerZero V2 Docs**: [https://docs.layerzero.network/v2/](https://docs.layerzero.network/v2/)
- **Solana Developer Docs**: [https://docs.layerzero.network/v2/developers/solana](https://docs.layerzero.network/v2/developers/solana)
- **OApp Overview**: [https://docs.layerzero.network/v2/developers/solana/oapp/overview](https://docs.layerzero.network/v2/developers/solana/oapp/overview)
- **OFT Program**: [https://docs.layerzero.network/v2/developers/solana/oft/program](https://docs.layerzero.network/v2/developers/solana/oft/program)
- **DevTools Repository**: [https://github.com/LayerZero-Labs/devtools](https://github.com/LayerZero-Labs/devtools)

### Development Resources
- **Solana Docs**: [https://docs.solana.com/](https://docs.solana.com/)
- **Anchor Framework**: [https://www.anchor-lang.com/](https://www.anchor-lang.com/)
- **Hardhat Docs**: [https://hardhat.org/](https://hardhat.org/)
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/)

### Monitoring & Debugging
- **LayerZero Scan**: [https://layerzeroscan.com/](https://layerzeroscan.com/)
- **Deployed Contracts**: [https://docs.layerzero.network/v2/deployments/deployed-contracts](https://docs.layerzero.network/v2/deployments/deployed-contracts)

## 🔐 Security Considerations

### Production Deployment
1. **Audit Contracts**: Use Slither for EVM, manual review for Solana
2. **Multi-DVN Setup**: Configure multiple DVNs for security
3. **Timelock Values**: Set appropriate timelock periods
4. **Guardian Selection**: Choose trusted guardians
5. **Private Key Management**: Never expose private keys

### LayerZero V2 Security
- Use official SDK and endpoints only
- Configure proper DVN settings
- Monitor cross-chain messages
- Implement proper access controls
- Regular security updates

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow LayerZero best practices
4. Commit changes with proper testing
5. Create Pull Request

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Repository Issues](https://github.com/your-repo/reclaimx/issues)
- **LayerZero Discord**: [LayerZero Community](https://discord.gg/layerzero)
- **Solana Discord**: [Solana Community](https://discord.gg/solana)

---

**Built for LayerZero Hackathon - "Best Omnichain Solution on Solana" Prize** 🏆

*Empowering secure, cross-chain wallet recovery and inheritance through official LayerZero V2 Solana SDK integration.*

## 🎯 Key Differentiators

1. **Official SDK Integration**: Uses LayerZero's official Solana SDK from devtools repository
2. **Production-Ready**: Real endpoint addresses, proper error handling, comprehensive testing
3. **Professional UI**: Enhanced React frontend with monitoring and debugging tools
4. **Comprehensive Documentation**: Step-by-step guides following official LayerZero patterns
5. **Security-First**: Multi-DVN configuration, proper access controls, audit-ready code
6. **Developer Experience**: Clear deployment scripts, troubleshooting guides, and monitoring tools

This implementation showcases the full potential of LayerZero V2 for cross-chain applications on Solana, providing a solid foundation for the hackathon submission and future development.
