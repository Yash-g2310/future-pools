// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title StakingPool - PYUSD Staking Pool for Future Pools Platform
contract StakingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Borrowed(address indexed escrow, address indexed user, uint256 amount);
    event Repaid(address indexed escrow, address indexed user, uint256 amount);
    event FactorySet(address indexed factory);
    event EscrowAuthorized(address indexed escrow);

    // State variables
    IERC20 public immutable pyusd;
    
    // User balances
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lockedBalance; // Locked in active escrows
    
    // Authorized escrow contracts
    mapping(address => bool) public authorizedEscrows;
    
    // Total staked and locked
    uint256 public totalStaked;
    uint256 public totalLocked;

    // Add factory management
    address public factory;

    constructor(address _pyusd) Ownable(msg.sender) {
        require(_pyusd != address(0), "Invalid PYUSD address");
        pyusd = IERC20(_pyusd);
    }

    /// @notice Stake PYUSD tokens
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        pyusd.safeTransferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    /// @notice Unstake PYUSD tokens
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(availableBalance(msg.sender) >= amount, "Amount locked in escrows");
        
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        pyusd.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    /// @notice Borrow PYUSD from user's staked balance (called by escrow)
    /// @param user User to borrow from  
    /// @param amount Amount to borrow
    function borrowFromStake(address user, uint256 amount) external nonReentrant {
        require(authorizedEscrows[msg.sender], "Not authorized escrow");
        require(availableBalance(user) >= amount, "Insufficient available balance");
        
        // Lock the borrowed amount
        lockedBalance[user] += amount;
        totalLocked += amount;
        
        // Transfer PYUSD to the calling escrow contract
        pyusd.safeTransfer(msg.sender, amount);
        
        emit Borrowed(msg.sender, user, amount);
    }

    /// @notice Repay PYUSD to user's staked balance (called by escrow)
    /// @param user User to repay to
    /// @param amount Amount to repay (including any profits)
    function repayToStake(address user, uint256 amount) external nonReentrant {
        require(authorizedEscrows[msg.sender], "Not authorized escrow");
        require(amount > 0, "Amount must be > 0");
        
        // Receive PYUSD from the calling escrow contract
        pyusd.safeTransferFrom(msg.sender, address(this), amount);
        
        // Unlock the original borrowed amount
        uint256 originalBorrowed = lockedBalance[user];
        lockedBalance[user] = 0; // Unlock all
        totalLocked -= originalBorrowed;
        
        // Add the repaid amount to user's staked balance
        stakedBalance[user] += amount;
        totalStaked += amount;
        
        emit Repaid(msg.sender, user, amount);
    }

    /// @notice Set the factory address (only owner)
    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "Invalid factory address");
        factory = _factory;
        emit FactorySet(_factory);
    }

    /// @notice Modified authorize function to allow factory
    function authorizeEscrow(address escrow) external {
        require(
            msg.sender == owner() || msg.sender == factory, 
            "Only owner or factory can authorize"
        );
        require(escrow != address(0), "Invalid escrow address");
        authorizedEscrows[escrow] = true;
        emit EscrowAuthorized(escrow);
    }

    /// @notice Revoke escrow authorization
    function revokeEscrow(address escrow) external onlyOwner {
        authorizedEscrows[escrow] = false;
    }

    /// @notice Get available balance for user (staked - locked)
    function availableBalance(address user) public view returns (uint256) {
        return stakedBalance[user] - lockedBalance[user];
    }

    /// @notice Get user's complete balance info
    function getUserBalance(address user) external view returns (
        uint256 staked,
        uint256 locked,
        uint256 available
    ) {
        staked = stakedBalance[user];
        locked = lockedBalance[user];
        available = availableBalance(user);
    }
}