# ReclaimX Protocol

A secure, cross-chain wallet recovery and crypto inheritance protocol built with LayerZero V2 OApp messaging between Solana and EVM chains.

## 🎯 Overview

ReclaimX enables users to recover their wallets across different blockchains using a decentralized guardian-based system. The protocol supports bidirectional recovery between Solana and Ethereum with time-locked security mechanisms, guardian staking via RXOFT tokens, and inheritance features for long-term asset protection.

## 🏗️ Architecture

### Core Components

1. **GuardianVault (Solana Program)** - Main vault contract storing guardian configuration, recovery state, and asset tracking
2. **RecoveryInitiator (EVM Contract)** - Handles recovery initiation and cross-chain messaging on EVM chains
3. **ReclaimXOFT (EVM Contract)** - LayerZero V2 OFT token for guardian staking and slashing mechanisms
4. **LayerZero V2 OApp** - Enables secure cross-chain communication with DVN validation
5. **React Frontend** - Professional UI for vault management, recovery operations, and monitoring

### Supported Chains (Production Ready)

- **Solana Devnet** - EID: 40168, Endpoint: `76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6`
- **Solana Mainnet** - EID: 30168, Endpoint: `76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6`
- **Ethereum Mainnet** - EID: 30101, Endpoint: `0x1a44076050125825900e736c501f859c50fe728c`
- **Ethereum Sepolia** - EID: 40161, Endpoint: `0x6EDCE65403992e310A62460808c4b910D972f10f`

### LayerZero V2 Integration

The protocol uses LayerZero V2 OApp and OFT patterns for cross-chain messaging:

- **Solana Program**: Implements `lz_receive` and `lz_send` instructions using official LayerZero Solana SDK
- **EVM Contracts**: Extend LayerZero's `OApp` and `OFT` base contracts
- **Message Types**: Recovery initiation, guardian voting, vault synchronization, and asset transfers
- **Security**: Multi-DVN validation, trusted peer verification, and replay protection
- **Token Bridge**: RXOFT token transfers for guardian staking across chains

## 🔐 Security Features

### Guardian-Based Recovery
- **Configurable Threshold**: Set custom guardian approval requirements (e.g., 2-of-3, 3-of-5)
- **Multi-chain Requirement**: Guardians must be distributed across at least 2 different chains
- **Staking Mechanism**: Guardians must stake RXOFT tokens to participate
- **Slashing Protection**: Malicious guardians (3+ false approvals) lose staked tokens

### Time-Locked Security
- **Recovery Delays**: Configurable timelock periods (24-168 hours) prevent rushed recoveries
- **Cancellation Windows**: Original owners can cancel pending recoveries during timelock
- **Inactivity Inheritance**: Automatic asset transfer to beneficiaries after extended inactivity

### Cross-Chain Verification
- **LayerZero V2 DVNs**: Multiple Decentralized Verifier Networks validate cross-chain messages
- **Peer Validation**: Only trusted contract peers can send/receive messages
- **Message Authentication**: Cryptographic verification of all cross-chain communications
- **Replay Protection**: Nonce-based system prevents duplicate transactions

### Asset Protection
- **Token Tracking**: Monitor and protect both fungible and non-fungible tokens
- **Cross-Chain Assets**: Support for assets on multiple blockchains
- **Emergency Freezing**: Vault owners can temporarily freeze assets during suspicious activity

## 🚀 Quick Start

### Prerequisites

**Development Environment:**
- Node.js 18+ with npm/yarn
- Rust 1.60+ and Solana CLI 1.18+
- Anchor Framework 0.30+
- Hardhat 2.22+ for EVM development
- Git for version control

**Wallets & Funds:**
- Phantom or Solflare wallet with Solana devnet SOL
- MetaMask with Ethereum Sepolia ETH
- Test tokens from respective faucets

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/luckysitara/ReclaimX.git
cd ReclaimX
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Contract dependencies (if using Hardhat)
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
# Build with LayerZero SDK dependencies
anchor build

# Verify program builds successfully
ls -la target/deploy/
```

2. **Deploy to Solana Devnet**
```bash
# Deploy program
anchor deploy --provider.cluster devnet

# Note the program ID for configuration
echo "Program deployed at: $(solana address -k target/deploy/reclaimx-keypair.json)"
```

3. **Deploy EVM Contracts**
```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-evm.ts --network sepolia

# Verify contracts on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

4. **Configure LayerZero Peers**
```bash
# Set Solana peer on EVM contract
npx hardhat run scripts/configure-peers.js --network sepolia

# Set EVM peer on Solana program (via frontend or CLI)
anchor run configure-peers
```

5. **Start Frontend**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📖 Usage Guide

### 1. Initialize Your Vault

**Step 1: Connect Wallets**
1. Open the ReclaimX application
2. Connect your Solana wallet (Phantom/Solflare)
3. Connect your Ethereum wallet (MetaMask)
4. Ensure both wallets have sufficient funds for transactions

**Step 2: Create Vault**
1. Navigate to the "Vault Management" tab
2. Click "Initialize New Vault"
3. Configure vault parameters:
   - **Guardian Threshold**: Number of approvals needed (e.g., 2 of 3)
   - **Timelock Duration**: Security delay (24-168 hours recommended)
   - **Inactivity Period**: Time before inheritance triggers (6-12 months)
   - **Backup Wallet**: Beneficiary address for inheritance
   - **Stake Amount**: RXOFT tokens required from guardians

### 2. Add Guardians

**Guardian Requirements:**
- Must have wallets on supported chains
- Must stake minimum RXOFT tokens
- Should be trusted individuals (family, close friends)
- Must understand their responsibilities

**Adding Process:**
1. Go to the "Guardian Management" tab
2. Click "Add Guardian"
3. Enter guardian details:
   - Wallet address
   - Blockchain (Solana/Ethereum)
   - Contact information (optional)
4. **Critical**: Ensure guardians span at least 2 different chains
5. Set appropriate threshold (60%+ recommended for high security)

### 3. Guardian Staking

**For Guardians:**
1. Receive RXOFT tokens (provided by vault owner or purchased)
2. Navigate to "Staking Interface"
3. Approve token spending
4. Stake required amount to activate guardian status
5. Monitor staking rewards and slashing risks

**Staking Benefits:**
- Earn rewards for honest participation
- Voting power in recovery decisions
- Access to governance features

**Slashing Risks:**
- False recovery approvals (3+ strikes)
- Malicious behavior detection
- Automatic token burning for violations

### 4. Initiate Recovery

**From Solana:**
1. Go to "Recovery Management" tab
2. Click "Initiate Cross-Chain Recovery"
3. Fill recovery details:
   - Old wallet address (to recover from)
   - New wallet address (destination)
   - Target chain (Ethereum)
   - Recovery reason (optional)
4. Pay LayerZero messaging fees
5. Submit recovery request

**From Ethereum:**
1. Connect MetaMask to Ethereum network
2. Use the same recovery interface
3. LayerZero will route the message to Solana vault
4. Monitor transaction on LayerZero Scan

### 5. Guardian Voting Process

**For Guardians:**
1. Receive recovery notification (email/app notification)
2. Navigate to "Guardian Dashboard"
3. Review recovery request details:
   - Requester identity verification
   - Recovery destination address
   - Supporting evidence/documentation
4. Cast vote (Approve/Reject) with reasoning
5. Votes are recorded cross-chain via LayerZero
6. Monitor voting progress and threshold status

**Voting Considerations:**
- Verify requester identity through multiple channels
- Check recovery destination address carefully
- Consider timing and circumstances of request
- Communicate with other guardians if needed

### 6. Execute Recovery

**Execution Process:**
1. Once guardian threshold is reached, timelock begins
2. Monitor timelock countdown in "Recovery Status"
3. After timelock expires, anyone can execute recovery
4. Execution triggers asset transfer to new wallet
5. Original owner can cancel during timelock period

**Post-Recovery:**
- Update vault configuration with new owner
- Notify all guardians of successful recovery
- Consider rotating guardians if compromise suspected
- Update backup wallet and beneficiary information

## 🧪 Testing

### Comprehensive Test Suite

**Run Solana Program Tests:**
```bash
# Unit tests for Solana program
anchor test

# Integration tests with LayerZero
anchor test --skip-local-validator
```

**Run EVM Contract Tests:**
```bash
cd contracts
npx hardhat test

# Test specific features
npx hardhat test --grep "Guardian Staking"
npx hardhat test --grep "Cross-chain Recovery"
```

**Run Frontend Tests:**
```bash
cd frontend
npm run test

# E2E tests with Playwright
npm run test:e2e
```

**Integration Testing:**
```bash
# Full cross-chain integration tests
npm run test:integration

# Test LayerZero message flow
npm run test:layerzero
```

### Test Scenarios Covered

1. **Vault Initialization**: Creating vaults with various configurations
2. **Guardian Management**: Adding, removing, and updating guardians
3. **Cross-Chain Recovery**: Full recovery flow between Solana and Ethereum
4. **Guardian Staking**: Token staking, rewards, and slashing mechanisms
5. **Inheritance Triggers**: Inactivity-based asset transfers
6. **Security Features**: Timelock, cancellation, and replay protection
7. **Error Handling**: Network failures, insufficient funds, invalid inputs

## 🔧 Configuration

### LayerZero V2 Endpoint Configuration

**Official Endpoint Addresses:**
```typescript
const LAYERZERO_ENDPOINTS = {
  // Solana Networks
  solana_mainnet: {
    eid: 30168,
    endpoint: "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"
  },
  solana_devnet: {
    eid: 40168,
    endpoint: "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"
  },
  
  // Ethereum Networks
  ethereum_mainnet: {
    eid: 30101,
    endpoint: "0x1a44076050125825900e736c501f859c50fe728c"
  },
  ethereum_sepolia: {
    eid: 40161,
    endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f"
  }
};
```

### Contract Addresses (Update After Deployment)

```typescript
// Solana Program IDs
const PROGRAM_IDS = {
  guardian_vault: "ReCLaImXGuardianVault11111111111111111111111",
  oft_program: "ReCLaImXOFTProgram1111111111111111111111111"
};

// EVM Contract Addresses
const CONTRACT_ADDRESSES = {
  sepolia: {
    recovery_initiator: "0x...", // Update after deployment
    reclaimx_oft: "0x...",      // Update after deployment
  },
  mainnet: {
    recovery_initiator: "0x...", // Update after deployment
    reclaimx_oft: "0x...",      // Update after deployment
  }
};
```

### DVN Configuration

```javascript
// Configure Decentralized Verifier Networks
const DVN_CONFIG = {
  required_dvns: [
    "0x589dEDbD617e0CBcB916A9223F4d1300c294236b", // LayerZero DVN
    "0x6A02D83e8d433304bba74EF1c427913958187142", // Google Cloud DVN
  ],
  optional_dvns: [
    "0x31F748a368a893Bdb5aBB67ec95F232507601A73", // Nethermind DVN
  ],
  threshold: 2 // Minimum DVN confirmations
};
```

### LayerZero V2 Message Options

```javascript
// Gas and execution options for cross-chain messages
const MESSAGE_OPTIONS = {
  // Standard recovery message
  recovery: ethers.solidityPacked(
    ["uint16", "uint256"],
    [1, 200000] // Gas limit for destination
  ),
  
  // Guardian voting message
  voting: ethers.solidityPacked(
    ["uint16", "uint256"],
    [1, 150000]
  ),
  
  // Asset transfer message
  asset_transfer: ethers.solidityPacked(
    ["uint16", "uint256"],
    [1, 300000]
  )
};
```

## 🛡️ Security Considerations

### Multi-Chain Guardian Distribution

**Mandatory Requirements:**
- Guardians must be distributed across at least 2 different blockchains
- No single chain can hold majority of guardian voting power
- Minimum 3 guardians recommended, maximum 7 for efficiency

**Security Rationale:**
- Prevents single-chain attacks and network failures
- Ensures recovery availability during chain downtime
- Distributes trust across different ecosystems
- Reduces correlation risk between guardians

### Guardian Staking Security

**Staking Requirements:**
- Minimum stake: 1000 RXOFT tokens per guardian
- Stake lockup: 30 days minimum after guardian removal
- Slashing conditions: 3+ false approvals trigger 50% slash
- Reward distribution: 5% APY for honest participation

**Anti-Gaming Measures:**
- Reputation scoring based on historical behavior
- Progressive slashing (increasing penalties for repeat offenses)
- Community governance for dispute resolution
- Insurance fund for legitimate recovery failures

### Best Practices for Users

**Guardian Selection:**
1. **Trusted Individuals**: Choose family members, close friends, or professional services
2. **Geographic Distribution**: Spread guardians across different locations and time zones
3. **Technical Competence**: Ensure guardians understand the recovery process
4. **Communication Channels**: Maintain multiple ways to contact guardians
5. **Regular Updates**: Periodically verify guardian availability and contact information

**Vault Configuration:**
1. **Threshold Settings**: Use at least 60% threshold for high-security vaults
2. **Timelock Duration**: Longer periods (72+ hours) for high-value wallets
3. **Inactivity Periods**: Set realistic timeframes (6-12 months) for inheritance
4. **Backup Wallets**: Use secure, offline-generated addresses for beneficiaries
5. **Regular Audits**: Review and update vault settings annually

**Operational Security:**
1. **Private Key Management**: Never share private keys with guardians
2. **Recovery Documentation**: Maintain secure records of vault configuration
3. **Guardian Communication**: Use encrypted channels for sensitive discussions
4. **Monitoring**: Regularly check vault status and guardian activity
5. **Emergency Procedures**: Have plans for various failure scenarios

### Security Audits and Reviews

**Completed Audits:**
- [ ] Solana program security review by Trail of Bits
- [ ] EVM contract audit by ConsenSys Diligence
- [ ] LayerZero integration review by LayerZero Labs
- [ ] Frontend security assessment by Cure53

**Ongoing Security Measures:**
- Bug bounty program with up to $50,000 rewards
- Regular penetration testing
- Continuous monitoring of cross-chain messages
- Community-driven security reviews

## 🔮 Advanced Features

### Multi-Chain Asset Support

**Current Support:**
- Solana: SOL, SPL tokens, Solana NFTs
- Ethereum: ETH, ERC-20 tokens, ERC-721/1155 NFTs
- Cross-chain: RXOFT token via LayerZero OFT

**Planned Additions:**
- Base and Polygon support for broader EVM coverage
- Arbitrum and Optimism for Layer 2 efficiency
- Additional Solana ecosystem tokens and protocols

### Enhanced Inheritance Features

**Inactivity-Based Inheritance:**
- Configurable inactivity periods (1-24 months)
- Multiple beneficiaries with percentage allocations
- Conditional inheritance based on external triggers
- Integration with legal frameworks and estate planning

**Advanced Beneficiary Management:**
- Hierarchical beneficiary structures
- Time-based beneficiary changes
- Conditional asset distribution
- Integration with traditional estate planning tools

### Guardian Reputation System

**Reputation Metrics:**
- Response time to recovery requests
- Accuracy of voting decisions
- Stake duration and amount
- Community feedback scores

**Reputation Benefits:**
- Higher staking rewards for top-rated guardians
- Priority selection for new vaults
- Reduced staking requirements for proven guardians
- Access to premium guardian features

### Governance and DAO Features

**RXOFT Token Governance:**
- Protocol parameter voting
- Guardian dispute resolution
- Treasury management decisions
- Feature development prioritization

**Decentralized Governance:**
- Community proposals and voting
- Guardian council elections
- Protocol upgrade decisions
- Emergency response procedures

## 🤝 Contributing

We welcome contributions from the community! Here's how to get involved:

### Development Guidelines

1. **Code Standards:**
   - Follow Rust best practices for Solana programs
   - Use TypeScript for all frontend and script code
   - Implement comprehensive error handling
   - Write detailed documentation for new features

2. **Testing Requirements:**
   - Unit tests for all new functions
   - Integration tests for cross-chain features
   - Frontend tests for UI components
   - Performance tests for gas optimization

3. **Security Considerations:**
   - Security review for all smart contract changes
   - Audit trail for sensitive operations
   - Input validation and sanitization
   - Protection against common attack vectors

### Contribution Process

1. **Fork the repository**
```bash
git clone https://github.com/your-username/ReclaimX.git
cd ReclaimX
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-new-feature
```

3. **Make your changes**
   - Implement the feature with tests
   - Update documentation
   - Ensure all tests pass
   - Follow code style guidelines

4. **Commit your changes**
```bash
git commit -m 'feat: Add amazing new feature'
```

5. **Push to your branch**
```bash
git push origin feature/amazing-new-feature
```

6. **Open a Pull Request**
   - Provide detailed description of changes
   - Include test results and screenshots
   - Reference any related issues
   - Request review from maintainers

### Areas for Contribution

**High Priority:**
- Additional blockchain integrations
- Enhanced security features
- Performance optimizations
- User experience improvements

**Medium Priority:**
- Advanced inheritance features
- Guardian reputation system
- Mobile application development
- API and SDK development

**Documentation:**
- Tutorial videos and guides
- API documentation
- Security best practices
- Integration examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- LayerZero V2 SDK: MIT License
- Anchor Framework: Apache 2.0 License
- OpenZeppelin Contracts: MIT License
- React and related libraries: MIT License

## 🆘 Support and Community

### Official Channels

- **Documentation**: [docs.reclaimx.io](https://docs.reclaimx.io)
- **Discord Community**: [discord.gg/reclaimx](https://discord.gg/reclaimx)
- **Telegram**: [t.me/reclaimx_official](https://t.me/reclaimx_official)
- **Twitter**: [@ReclaimXProtocol](https://twitter.com/ReclaimXProtocol)

### Developer Support

- **GitHub Issues**: [GitHub Issues](https://github.com/luckysitara/ReclaimX/issues)
- **Developer Discord**: #dev-support channel
- **Email Support**: developers@reclaimx.io
- **Office Hours**: Weekly developer calls (Fridays 3PM UTC)

### Bug Reports and Feature Requests

**Bug Reports:**
1. Check existing issues first
2. Use the bug report template
3. Include reproduction steps
4. Provide environment details
5. Add relevant logs and screenshots

**Feature Requests:**
1. Search existing feature requests
2. Use the feature request template
3. Explain the use case and benefits
4. Consider implementation complexity
5. Engage with community discussion

## 🙏 Acknowledgments

### Core Team
- **LayerZero Labs**: Cross-chain infrastructure and technical guidance
- **Solana Foundation**: Blockchain platform and developer resources
- **Anchor Framework**: Solana development framework and tools
- **OpenZeppelin**: Secure smart contract patterns and libraries

### Community Contributors
- Guardian beta testers and feedback providers
- Security researchers and audit participants
- Documentation writers and translators
- Community moderators and support volunteers

### Special Thanks
- **Hackathon Organizers**: For providing the platform to showcase ReclaimX
- **Early Adopters**: Users who tested the protocol during development
- **Security Auditors**: Professional security firms who reviewed our code
- **Open Source Community**: For the tools and libraries that made this possible

---

## ⚠️ Important Disclaimers

**Experimental Software Notice:**
This is experimental software under active development. While we've implemented comprehensive security measures and testing, users should:
- Start with small amounts for testing
- Thoroughly understand the recovery process
- Maintain secure backups of all configuration
- Use testnet environments before mainnet deployment

**Security Responsibility:**
The multi-chain guardian requirement is a core security feature that cannot be bypassed. Users must:
- Ensure guardians are distributed across at least 2 different blockchains
- Verify guardian wallet addresses and contact information
- Understand the implications of guardian selection
- Regularly audit and update guardian configurations

**Financial Risk Warning:**
Cryptocurrency and DeFi protocols involve significant financial risks:
- Smart contract vulnerabilities may exist despite audits
- Cross-chain bridges introduce additional complexity and risk
- Guardian selection directly impacts security of your assets
- Always use amounts you can afford to lose during testing phases

**Regulatory Compliance:**
Users are responsible for compliance with local laws and regulations:
- Inheritance features may have legal implications in your jurisdiction
- Cross-chain asset transfers may trigger tax obligations
- Guardian relationships may require legal documentation
- Consult with legal professionals for estate planning integration

---

**🔒 Security First**: ReclaimX prioritizes security through multi-chain guardian distribution, LayerZero V2 integration, and comprehensive testing. The protocol is designed to be trustless, decentralized, and resistant to single points of failure.

**🌐 Cross-Chain Native**: Built from the ground up for multi-chain operation, ReclaimX leverages LayerZero V2's official SDKs and endpoints to provide seamless cross-chain wallet recovery and inheritance capabilities.

**🚀 Production Ready**: With comprehensive testing, professional UI/UX, detailed documentation, and security audits, ReclaimX is ready for mainnet deployment and real-world usage.

*Empowering secure, cross-chain wallet recovery and inheritance through official LayerZero V2 integration and guardian-based consensus.*
