// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReclaimXOFT is OFT {
    mapping(address => uint256) public stakedBalances;
    mapping(address => bool) public authorizedSlashers;
    
    event TokensStaked(address indexed guardian, uint256 amount);
    event TokensSlashed(address indexed guardian, uint256 amount);
    event SlasherAuthorized(address indexed slasher, bool authorized);

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        // Mint initial supply to owner
        _mint(_delegate, 1000000 * 10**decimals());
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, address(this), amount);
        stakedBalances[msg.sender] += amount;

        emit TokensStaked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");

        stakedBalances[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
    }

    function slash(address guardian, uint256 amount) external {
        require(authorizedSlashers[msg.sender], "Not authorized to slash");
        require(stakedBalances[guardian] >= amount, "Insufficient staked balance");

        stakedBalances[guardian] -= amount;
        _burn(address(this), amount);

        emit TokensSlashed(guardian, amount);
    }

    function authorizeSlasher(address slasher, bool authorized) external onlyOwner {
        authorizedSlashers[slasher] = authorized;
        emit SlasherAuthorized(slasher, authorized);
    }

    function getStakedBalance(address guardian) external view returns (uint256) {
        return stakedBalances[guardian];
    }

    // Override to handle cross-chain transfers
    function _debit(
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal override returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        (amountSentLD, amountReceivedLD) = _debitView(_amountLD, _minAmountLD, _dstEid);
        _burn(msg.sender, amountSentLD);
    }

    function _credit(
        address _to,
        uint256 _amountLD,
        uint32 _srcEid
    ) internal override returns (uint256 amountReceivedLD) {
        _mint(_to, _amountLD);
        return _amountLD;
    }
}
