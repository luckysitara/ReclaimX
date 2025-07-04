// Mock ABIs for the preview - replace with actual ABIs after deployment
export const RECOVERY_INITIATOR_ABI = [
  "function initializeVault(address[] guardians, uint8 threshold, uint64 timelock, uint64 inactivityPeriod, address backupWallet, uint64 stakeAmount, tuple(uint8 assetType, uint64 amount, address tokenAddress)[] assets)",
  "function initiateRecovery(bytes32 vaultId, address newOwner, bytes options) payable",
  "function approveRecovery(bytes32 vaultId, uint64 recoveryId)",
  "function markMalicious(bytes32 vaultId, uint64 recoveryId, address guardian)",
  "function checkInactivity(bytes32 vaultId)",
  "function updateLastActive(bytes32 vaultId)",
  "function getVault(bytes32 vaultId) view returns (address owner, address[] guardians, uint8 threshold, uint64 timelock, uint64 inactivityPeriod, address backupWallet, uint64 stakeAmount, uint8 recoveryState, uint64 recoveryId, uint64 lastActiveTimestamp)",
  "function getRecovery(bytes32 vaultId, uint64 recoveryId) view returns (address newOwner, address[] approvals, address[] maliciousApprovals, uint64 startTimestamp, bool completed)",
  "function quote(uint32 _dstEid, bytes _message, bytes _options, bool _payInLzToken) view returns (tuple(uint256 nativeFee, uint256 lzTokenFee))",
  "event VaultInitialized(bytes32 indexed vaultId, address indexed owner)",
  "event RecoveryInitiated(bytes32 indexed vaultId, uint64 recoveryId, address newOwner)",
  "event CrossChainMessageSent(uint32 indexed dstEid, bytes32 indexed vaultId, uint64 recoveryId)",
]

export const RECLAIMX_OFT_ABI = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function slash(address guardian, uint256 amount)",
  "function getStakedBalance(address guardian) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function send(tuple(uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd) sendParam, tuple(uint256 nativeFee, uint256 lzTokenFee) fee, address refundTo) payable returns (tuple(bytes32 guid, uint256 amountSentLD, uint256 amountReceivedLD))",
]
