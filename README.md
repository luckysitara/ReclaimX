# ReclaimX Protocol

A secure, cross-chain wallet recovery and crypto inheritance protocol built with LayerZero V2 OApp messaging between Solana and EVM chains.

## 🎯 Overview

ReclaimX enables users to recover their wallets across different blockchains using a decentralized guardian-based system. The protocol supports bidirectional recovery between Solana and Ethereum with time-locked security mechanisms.

## 🏗️ Architecture

### Core Components

1. **GuardianVault (Solana Program)** - Main vault contract storing guardian configuration and recovery state
2. **RecoveryInitiator (EVM Contract)** - Handles recovery initiation and cross-chain messaging on EVM chains
3. **LayerZero V2 OApp** - Enables secure cross-chain communication
4. **React Frontend** - User interface for vault management and recovery operations

### Supported Chains (MVP)

- **Solana** (Devnet/Mainnet) - EID: 30168
- **Ethereum** (Sepolia/Mainnet) - EID: 30101

### LayerZero V2 Integration

The protocol uses LayerZero V2 OApp pattern for cross-chain messaging:

- **Solana Program**: Implements `lz_receive` and `lz_send` instructions
- **EVM Contract**: Extends LayerZero's `OApp` base contract
- **Message Types**: Recovery initiation and guardian voting
- **Security**: Trusted peer validation and replay protection

## 🔐 Security Features

- **Guardian-based Recovery**: Configurable threshold of trusted guardians
- **Multi-chain Requirement**: Guardians must be from at least 2 different chains
- **Time-locked Execution**: Security delays prevent malicious recovery attempts
- **Cross-chain Verification**: Guardian votes verified via LayerZero messages
- **Replay Protection**: Prevents duplicate votes and recovery attempts
- **Cancellation Windows**: Original owners can cancel pending recoveries

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust and Solana CLI
- Anchor Framework 0.29+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/luckysitara/ReclaimX.git
cd ReclaimX
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install && cd ..
cd contracts && npm install && cd ..
```

3. **Set up environment variables**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Build and Deploy

1. **Build Solana Program**
```bash
anchor build
```

2. **Deploy to Solana Devnet**
```bash
anchor deploy --provider.cluster devnet
```

3. **Deploy EVM Contracts**
```bash
cd contracts
npx hardhat deploy --network sepolia
```

4. **Configure LayerZero Peers**
```bash
# Set Solana peer on EVM contract
npx hardhat run scripts/configure-peers.js --network sepolia

# Set EVM peer on Solana program
anchor run configure-peers
```

5. **Start Frontend**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Usage Guide

### 1. Initialize Your Vault

1. Connect your Solana wallet (Phantom/Solflare)
2. Navigate to the Dashboard tab
3. Click "Initialize Vault" and set your preferences:
   - Guardian threshold (e.g., 2 of 3)
   - Time lock duration (24-72 hours recommended)

### 2. Add Guardians

1. Go to the Guardians tab
2. Click "Add Guardian"
3. Enter guardian wallet address and select their chain
4. **Important**: You must have guardians on at least 2 different chains
5. Set appropriate threshold (60%+ recommended for high security)

### 3. Initiate Recovery

**From Solana:**
1. Go to Recovery tab → "Initiate Recovery"
2. Enter old wallet address (to recover)
3. Enter new wallet address (destination)
4. Select target chain
5. Submit recovery request

**From EVM Chain:**
1. Connect MetaMask to Ethereum Sepolia
2. Use the same recovery interface
3. LayerZero will route the message to Solana vault

### 4. Guardian Voting

1. Guardians receive notifications of pending recoveries
2. Navigate to "Guardian Votes" tab
3. Review recovery details carefully
4. Vote to approve or reject
5. Votes are recorded cross-chain via LayerZero

### 5. Execute Recovery

1. Once threshold is reached, time lock begins
2. After time lock expires, anyone can execute
3. Original owner can cancel during time lock period
4. Successful execution transfers wallet control

## 🧪 Testing

### Run Solana Tests
```bash
anchor test
```

### Run EVM Contract Tests
```bash
cd contracts
npx hardhat test
```

### Run Integration Tests
```bash
npm run test:integration
```

## 🔧 Configuration

### LayerZero V2 Endpoint IDs

- Solana Mainnet: `30168`
- Solana Testnet: `40168`
- Ethereum Mainnet: `30101`
- Ethereum Sepolia: `40161`

### Contract Addresses

Update these after deployment:

```typescript
// Solana Program ID
const GUARDIAN_VAULT_PROGRAM_ID = "ReCLaImXGuardianVault11111111111111111111111"

// EVM Contract Addresses
const RECOVERY_INITIATOR_ADDRESSES = {
  sepolia: "0x...", // Update after deployment
  mainnet: "0x...", // Update after deployment
}
```

### LayerZero V2 Configuration

```javascript
// Configure trusted peers
await recoveryInitiator.setPeer(SOLANA_EID, SOLANA_PEER_ADDRESS)
await guardianVault.setPeer(ETHEREUM_EID, ETHEREUM_PEER_ADDRESS)

// Set message options
const options = ethers.solidityPacked(
  ["uint16", "uint256"],
  [1, 200000] // Gas limit for destination
)
```

## 🛡️ Security Considerations

### Multi-Chain Guardian Requirement

- **Mandatory**: Guardians must be from at least 2 different chains
- **Rationale**: Prevents single-chain attacks and ensures recovery availability
- **Validation**: Enforced at both contract and frontend levels

### Best Practices

1. **Guardian Selection**
   - Choose trusted individuals (family, close friends)
   - Distribute across different geographic locations
   - Ensure guardians understand their responsibilities

2. **Threshold Configuration**
   - Use at least 60% threshold for high security
   - Consider 2-of-3 or 3-of-5 configurations
   - Balance security with availability

3. **Time Lock Settings**
   - Minimum 24 hours recommended
   - Longer periods for high-value wallets
   - Consider guardian response times

### Security Audits

- [ ] Solana program security review
- [ ] EVM contract audit
- [ ] LayerZero integration review
- [ ] Frontend security assessment

## 🔮 Advanced Features (Future)

### Base and Polygon Support
- Additional EVM chains for guardian diversity
- Enhanced cross-chain recovery options
- Broader ecosystem integration

### Inheritance Mode
- Automatic asset transfer after inactivity period
- Beneficiary designation with guardian approval
- Estate planning integration

### Guardian Staking
- Token-based guardian requirements
- Slashing mechanisms for malicious behavior
- Reputation system for guardian reliability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Rust best practices for Solana programs
- Use TypeScript for all frontend code
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure LayerZero V2 compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.reclaimx.io](https://docs.reclaimx.io)
- **Discord**: [discord.gg/reclaimx](https://discord.gg/reclaimx)
- **Issues**: [GitHub Issues](https://github.com/your-org/reclaimx-protocol/issues)
- **Email**: support@reclaimx.io

## 🙏 Acknowledgments

- LayerZero Labs for cross-chain infrastructure
- Solana Foundation for blockchain platform
- Anchor Framework for Solana development tools
- OpenZeppelin for secure contract patterns

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Always test thoroughly on testnets before mainnet deployment.

**🔒 Security Notice**: The multi-chain guardian requirement is a core security feature. Ensure you have guardians on at least 2 different blockchains before relying on the recovery system.
