// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RecoveryInitiator is OApp, ReentrancyGuard {
    using OptionsBuilder for bytes;

    struct Vault {
        address owner;
        address[] guardians;
        uint8 threshold;
        uint64 timelock;
        uint64 inactivityPeriod;
        address backupWallet;
        uint64 stakeAmount;
        Asset[] assets;
        RecoveryState recoveryState;
        uint64 recoveryId;
        uint64 lastActiveTimestamp;
        mapping(uint64 => Recovery) recoveries;
    }

    struct Recovery {
        address newOwner;
        address[] approvals;
        address[] maliciousApprovals;
        uint64 startTimestamp;
        bool completed;
    }

    struct Asset {
        AssetType assetType;
        uint64 amount;
        address tokenAddress;
    }

    enum AssetType { Token, NFT }
    enum RecoveryState { None, Pending, Completed }

    struct RecoveryMessage {
        bytes32 vaultId;
        address newOwner;
        uint64 recoveryId;
        uint8 action; // 0 = Initiate, 1 = Approve
    }

    mapping(bytes32 => Vault) public vaults;
    mapping(bytes32 => mapping(uint64 => Recovery)) public recoveries;
    address public reclaimXOFT;
    
    // LayerZero V2 Chain IDs - Official
    uint32 public constant SOLANA_EID = 40168;     // Solana Devnet
    uint32 public constant ETHEREUM_EID = 30101;   // Ethereum Mainnet
    uint32 public constant SEPOLIA_EID = 40161;    // Sepolia Testnet
    uint32 public constant ARBITRUM_EID = 30110;   // Arbitrum One
    uint32 public constant POLYGON_EID = 30109;    // Polygon

    // Supported destination chains for cross-chain recovery
    mapping(uint32 => bool) public supportedChains;

    event VaultInitialized(bytes32 indexed vaultId, address indexed owner);
    event RecoveryInitiated(bytes32 indexed vaultId, uint64 recoveryId, address newOwner);
    event RecoveryApproved(bytes32 indexed vaultId, uint64 recoveryId, address guardian);
    event RecoveryCompleted(bytes32 indexed vaultId, uint64 recoveryId, address newOwner);
    event GuardianSlashed(bytes32 indexed vaultId, address guardian, uint256 amount);
    event CrossChainMessageSent(uint32 indexed dstEid, bytes32 indexed vaultId, uint64 recoveryId);
    event SupportedChainUpdated(uint32 indexed eid, bool supported);

    constructor(
        address _endpoint,
        address _owner,
        address _reclaimXOFT
    ) OApp(_endpoint, _owner) Ownable(_owner) {
        reclaimXOFT = _reclaimXOFT;
        
        // Initialize supported chains
        supportedChains[SOLANA_EID] = true;
        supportedChains[ETHEREUM_EID] = true;
        supportedChains[SEPOLIA_EID] = true; // For testing
    }

    function setSupportedChain(uint32 _eid, bool _supported) external onlyOwner {
        supportedChains[_eid] = _supported;
        emit SupportedChainUpdated(_eid, _supported);
    }

    function initializeVault(
        address[] memory guardians,
        uint8 threshold,
        uint64 timelock,
        uint64 inactivityPeriod,
        address backupWallet,
        uint64 stakeAmount,
        Asset[] memory assets
    ) external {
        require(guardians.length >= threshold && threshold > 0, "Invalid threshold");
        require(backupWallet != address(0), "Invalid backup wallet");

        bytes32 vaultId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.number));
        
        Vault storage vault = vaults[vaultId];
        vault.owner = msg.sender;
        vault.guardians = guardians;
        vault.threshold = threshold;
        vault.timelock = timelock;
        vault.inactivityPeriod = inactivityPeriod;
        vault.backupWallet = backupWallet;
        vault.stakeAmount = stakeAmount;
        vault.recoveryState = RecoveryState.None;
        vault.recoveryId = 0;
        vault.lastActiveTimestamp = uint64(block.timestamp);

        // Store assets
        for (uint i = 0; i < assets.length; i++) {
            vault.assets.push(assets[i]);
        }

        emit VaultInitialized(vaultId, msg.sender);
    }

    function initiateRecovery(
        bytes32 vaultId, 
        address newOwner,
        uint32 dstEid,
        bytes calldata _options
    ) external payable nonReentrant {
        Vault storage vault = vaults[vaultId];
        require(
            msg.sender == vault.owner || _isGuardian(vault, msg.sender),
            "Unauthorized"
        );
        require(newOwner != address(0), "Invalid new owner");
        require(supportedChains[dstEid], "Unsupported destination chain");

        vault.recoveryId++;
        vault.recoveryState = RecoveryState.Pending;
        vault.lastActiveTimestamp = uint64(block.timestamp);

        Recovery storage recovery = recoveries[vaultId][vault.recoveryId];
        recovery.newOwner = newOwner;
        recovery.startTimestamp = uint64(block.timestamp);

        // Prepare cross-chain message for Solana
        RecoveryMessage memory message = RecoveryMessage({
            vaultId: vaultId,
            newOwner: newOwner,
            recoveryId: vault.recoveryId,
            action: 0 // Initiate
        });

        bytes memory payload = abi.encode(message);
        
        // Use provided options or create default
        bytes memory options = _options.length > 0 ? _options : 
            OptionsBuilder.newOptions().addExecutorLzReceiveOption(200000, 0);

        _lzSend(
            dstEid,
            payload,
            options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit RecoveryInitiated(vaultId, vault.recoveryId, newOwner);
        emit CrossChainMessageSent(dstEid, vaultId, vault.recoveryId);
    }

    function approveRecovery(bytes32 vaultId, uint64 recoveryId) external {
        Vault storage vault = vaults[vaultId];
        require(_isGuardian(vault, msg.sender), "Not a guardian");
        require(vault.recoveryState == RecoveryState.Pending, "No active recovery");

        Recovery storage recovery = recoveries[vaultId][recoveryId];
        require(recovery.startTimestamp > 0, "Recovery not found");
        require(!recovery.completed, "Recovery already completed");
        require(!_hasApproved(recovery, msg.sender), "Already approved");

        recovery.approvals.push(msg.sender);

        emit RecoveryApproved(vaultId, recoveryId, msg.sender);

        // Check if threshold is met and timelock has passed
        if (recovery.approvals.length >= vault.threshold &&
            block.timestamp >= recovery.startTimestamp + vault.timelock) {
            
            _completeRecovery(vaultId, recoveryId);
        }
    }

    function markMalicious(bytes32 vaultId, uint64 recoveryId, address guardian) external {
        Vault storage vault = vaults[vaultId];
        require(_isGuardian(vault, msg.sender), "Not a guardian");
        require(vault.recoveryState == RecoveryState.Pending, "No active recovery");

        Recovery storage recovery = recoveries[vaultId][recoveryId];
        require(!_hasMaliciousVote(recovery, msg.sender), "Already voted malicious");

        recovery.maliciousApprovals.push(msg.sender);

        // If 3 or more guardians mark as malicious, slash the guardian
        if (recovery.maliciousApprovals.length >= 3) {
            _slashGuardian(vaultId, guardian);
        }
    }

    function checkInactivity(bytes32 vaultId) external {
        Vault storage vault = vaults[vaultId];
        require(
            block.timestamp >= vault.lastActiveTimestamp + vault.inactivityPeriod,
            "Not inactive yet"
        );

        vault.recoveryId++;
        vault.recoveryState = RecoveryState.Pending;

        Recovery storage recovery = recoveries[vaultId][vault.recoveryId];
        recovery.newOwner = vault.backupWallet;
        recovery.startTimestamp = uint64(block.timestamp);

        emit RecoveryInitiated(vaultId, vault.recoveryId, vault.backupWallet);
    }

    function updateLastActive(bytes32 vaultId) external {
        Vault storage vault = vaults[vaultId];
        require(msg.sender == vault.owner, "Not vault owner");
        
        vault.lastActiveTimestamp = uint64(block.timestamp);
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // Verify message is from Solana
        require(_origin.srcEid == SOLANA_EID, "Invalid source");
        
        RecoveryMessage memory message = abi.decode(_message, (RecoveryMessage));
        
        Vault storage vault = vaults[message.vaultId];
        require(vault.owner != address(0), "Vault not found");

        if (message.action == 0) {
            // Handle cross-chain recovery initiation from Solana
            vault.recoveryState = RecoveryState.Pending;
            Recovery storage recovery = recoveries[message.vaultId][message.recoveryId];
            recovery.newOwner = message.newOwner;
            recovery.startTimestamp = uint64(block.timestamp);
            
            emit RecoveryInitiated(message.vaultId, message.recoveryId, message.newOwner);
        } else if (message.action == 1) {
            // Handle cross-chain approval from Solana
            Recovery storage recovery = recoveries[message.vaultId][message.recoveryId];
            if (recovery.approvals.length >= vault.threshold &&
                block.timestamp >= recovery.startTimestamp + vault.timelock) {
                _completeRecovery(message.vaultId, message.recoveryId);
            }
        }
    }

    function _completeRecovery(bytes32 vaultId, uint64 recoveryId) internal {
        Vault storage vault = vaults[vaultId];
        Recovery storage recovery = recoveries[vaultId][recoveryId];

        vault.owner = recovery.newOwner;
        vault.recoveryState = RecoveryState.Completed;
        recovery.completed = true;

        emit RecoveryCompleted(vaultId, recoveryId, recovery.newOwner);
    }

    function _slashGuardian(bytes32 vaultId, address guardian) internal {
        Vault storage vault = vaults[vaultId];
        
        // Emit event for off-chain slashing process
        emit GuardianSlashed(vaultId, guardian, vault.stakeAmount);
    }

    function _isGuardian(Vault storage vault, address account) internal view returns (bool) {
        for (uint i = 0; i < vault.guardians.length; i++) {
            if (vault.guardians[i] == account) return true;
        }
        return false;
    }

    function _hasApproved(Recovery storage recovery, address guardian) internal view returns (bool) {
        for (uint i = 0; i < recovery.approvals.length; i++) {
            if (recovery.approvals[i] == guardian) return true;
        }
        return false;
    }

    function _hasMaliciousVote(Recovery storage recovery, address guardian) internal view returns (bool) {
        for (uint i = 0; i < recovery.maliciousApprovals.length; i++) {
            if (recovery.maliciousApprovals[i] == guardian) return true;
        }
        return false;
    }

    function quote(
        uint32 _dstEid,
        bytes memory _message,
        bytes memory _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        return _quote(_dstEid, _message, _options, _payInLzToken);
    }

    function getVault(bytes32 vaultId) external view returns (
        address owner,
        address[] memory guardians,
        uint8 threshold,
        uint64 timelock,
        uint64 inactivityPeriod,
        address backupWallet,
        uint64 stakeAmount,
        RecoveryState recoveryState,
        uint64 recoveryId,
        uint64 lastActiveTimestamp
    ) {
        Vault storage vault = vaults[vaultId];
        return (
            vault.owner,
            vault.guardians,
            vault.threshold,
            vault.timelock,
            vault.inactivityPeriod,
            vault.backupWallet,
            vault.stakeAmount,
            vault.recoveryState,
            vault.recoveryId,
            vault.lastActiveTimestamp
        );
    }

    function getRecovery(bytes32 vaultId, uint64 recoveryId) external view returns (
        address newOwner,
        address[] memory approvals,
        address[] memory maliciousApprovals,
        uint64 startTimestamp,
        bool completed
    ) {
        Recovery storage recovery = recoveries[vaultId][recoveryId];
        return (
            recovery.newOwner,
            recovery.approvals,
            recovery.maliciousApprovals,
            recovery.startTimestamp,
            recovery.completed
        );
    }
}
