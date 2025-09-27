// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable pyusd;
    address public factory;

    // User balances
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lockedBalance;

    // Authorized escrow contracts
    mapping(address => bool) public authorizedEscrows;

    // Global totals
    uint256 public totalStaked;
    uint256 public totalLocked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount, address indexed escrow);
    event Repaid(address indexed user, uint256 amount, address indexed escrow);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier onlyAuthorizedEscrow() {
        require(authorizedEscrows[msg.sender], "Not authorized escrow");
        _;
    }

    constructor(address _pyusd) {
        require(_pyusd != address(0), "Invalid PYUSD address");
        pyusd = IERC20(_pyusd);
    }

    /// @notice Set factory contract (only once)
    function setFactory(address _factory) external {
        require(factory == address(0), "Factory already set");
        require(_factory != address(0), "Invalid factory");
        factory = _factory;
    }

    /// @notice Authorize an escrow contract to borrow/repay
    function authorizeEscrow(address escrow) external onlyFactory {
        require(escrow != address(0), "Invalid escrow");
        authorizedEscrows[escrow] = true;
    }

    /// @notice Stake PYUSD tokens
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer PYUSD from user to this contract
        pyusd.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update balances
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    /// @notice Unstake PYUSD tokens
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(availableBalance(msg.sender) >= amount, "Insufficient available balance");
        
        // Update balances
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer PYUSD back to user
        pyusd.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    /// @notice Borrow from user's staked balance (called by authorized escrow)
    function borrowFromStake(address user, uint256 amount) external onlyAuthorizedEscrow {
        require(availableBalance(user) >= amount, "Insufficient available balance");
        
        // Lock the amount for this user
        lockedBalance[user] += amount;
        totalLocked += amount;
        
        // Transfer PYUSD to the calling escrow
        pyusd.safeTransfer(msg.sender, amount);
        
        emit Borrowed(user, amount, msg.sender);
    }

    /// @notice Repay to user's staked balance (called by authorized escrow) - SIMPLIFIED
    function repayToStake(address user, uint256 amount) external onlyAuthorizedEscrow {
        // Get the amount that was originally locked for this user
        uint256 originalLocked = lockedBalance[user];
        require(originalLocked > 0, "No locked balance to repay");

        // Unlock the original locked amount
        lockedBalance[user] -= originalLocked;
        totalLocked -= originalLocked;

        // Update staked balance to the new amount (could be more or less than original)
        if (amount >= originalLocked) {
            // Lender gained money
            uint256 profit = amount - originalLocked;
            stakedBalance[user] += profit;
            totalStaked += profit;
        } else {
            // Lender lost money  
            uint256 loss = originalLocked - amount;
            stakedBalance[user] -= loss;
            totalStaked -= loss;
        }

        emit Repaid(user, amount, msg.sender);
    }

    // View functions
    function availableBalance(address user) public view returns (uint256) {
        return stakedBalance[user] - lockedBalance[user];
    }

    function getUserBalance(address user) external view returns (uint256 staked, uint256 locked, uint256 available) {
        staked = stakedBalance[user];
        locked = lockedBalance[user];
        available = availableBalance(user);
    }
}