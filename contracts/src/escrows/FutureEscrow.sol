// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// Pyth Price Feed Interface
interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }
    
    function getPrice(bytes32 id) external view returns (Price memory price);
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable;
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount);
}

// Remove 1inch Router Interface - No longer needed

/// Staking Pool Interface
interface IStakingPool {
    function borrowFromStake(address user, uint256 amount) external;
    function repayToStake(address user, uint256 amount) external;
    function availableBalance(address user) external view returns (uint256);
    function authorizeEscrow(address escrow) external;
}

/// Identity Verification Interface
interface IProofOfHuman {
    function isVerified(address user) external view returns (bool);
}

/// Factory Interface for default reporting
interface IFutureEscrowFactory {
    function reportDefaultingBorrower(address borrower) external;
}

contract FutureEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { OPEN, BORROWED, COMPLETED, DEFAULTED }

    // Contract Configuration
    address public immutable lender;
    address public immutable tokenAddress;       // Token type lender specified
    uint256 public immutable tokenAmount;        // Token amount lender specified
    uint256 public immutable pyusdAmount;        // PYUSD amount (converted from token at creation)
    uint64 public immutable expireTime;          // Time until borrower can accept
    uint64 public immutable settlementTime;     // Duration after borrow until settlement

    // External Contracts (removed oneInchRouter)
    address public immutable pyusd;             // PYUSD token address
    address public immutable pyth;              // Pyth oracle contract
    address public immutable stakingPool;       // Staking Pool contract
    address public immutable proofOfHuman;      // Identity verification contract
    address public immutable factory;           // Factory that created this escrow
    bytes32 public immutable tokenPriceId;      // Token/USD Pyth price feed ID

    // State Variables
    State public state;
    address public borrower;
    uint64 public borrowTime;                    // When borrow() was called
    uint256 public borrowerCollateral;          // PYUSD collateral from borrower (50% of loan)

    // Events
    event Borrowed(address indexed borrower, uint256 pyusdReceived, uint256 collateralPosted);
    event Settled(address indexed winner, uint256 amount, bool lenderWon);
    event DefaultHandled(address indexed defaulter, uint256 lostAmount);

    constructor(
        address _lender,
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _pyusdAmount,
        uint64 _expireTime,
        uint64 _settlementTime,
        address _pyusd,
        address _pyth,
        address _stakingPool,
        address _proofOfHuman,
        address _factory,
        bytes32 _tokenPriceId
    ) {
        require(_lender != address(0) && _tokenAmount > 0 && _pyusdAmount > 0, "Invalid params");
        
        lender = _lender;
        tokenAddress = _tokenAddress;
        tokenAmount = _tokenAmount;
        pyusdAmount = _pyusdAmount;
        expireTime = _expireTime;
        settlementTime = _settlementTime;
        pyusd = _pyusd;
        pyth = _pyth;
        stakingPool = _stakingPool;
        proofOfHuman = _proofOfHuman;
        factory = _factory;
        tokenPriceId = _tokenPriceId;
        
        state = State.OPEN;
    }

    /// @notice Borrower accepts the offer by posting collateral and receiving PYUSD
    /// @param collateralAmount PYUSD collateral amount (must be 50% of loan)
    function borrow(uint256 collateralAmount) external nonReentrant {
        require(state == State.OPEN, "Not open");
        require(block.timestamp <= expireTime, "Offer expired");
        require(IProofOfHuman(proofOfHuman).isVerified(msg.sender), "Not verified");
        
        // Require exactly 50% collateral
        uint256 requiredCollateral = pyusdAmount / 2;
        require(collateralAmount == requiredCollateral, "Invalid collateral amount");
        
        // Transfer borrower's PYUSD collateral to contract
        IERC20(pyusd).safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        // Borrow PYUSD from lender's staked balance
        IStakingPool(stakingPool).borrowFromStake(lender, pyusdAmount);
        
        // Transfer PYUSD to borrower
        IERC20(pyusd).safeTransfer(msg.sender, pyusdAmount);
        
        // Update state
        borrower = msg.sender;
        borrowTime = uint64(block.timestamp);
        borrowerCollateral = collateralAmount;
        state = State.BORROWED;
        
        emit Borrowed(msg.sender, pyusdAmount, collateralAmount);
    }

    /// @notice Settle the future contract using current token price
    /// @param priceUpdateData Pyth price update data
    function settle(bytes[] calldata priceUpdateData) external payable nonReentrant {
        require(state == State.BORROWED, "Not borrowed");
        require(block.timestamp >= borrowTime + settlementTime, "Too early");

        // Update Pyth price feed
        uint256 fee = IPyth(pyth).getUpdateFee(priceUpdateData);
        require(msg.value >= fee, "Insufficient fee");
        IPyth(pyth).updatePriceFeeds{value: fee}(priceUpdateData);

        // Get current token price from Pyth
        IPyth.Price memory priceData = IPyth(pyth).getPrice(tokenPriceId);
        require(priceData.price > 0, "Invalid price");

        // Calculate current PYUSD value of the token amount
        uint256 currentTokenValue = _calculateTokenValueInPyusd(tokenAmount, priceData);

        IERC20 pyusdToken = IERC20(pyusd);

        // In futures: borrower pays currentTokenValue, lender receives currentTokenValue
        // Borrower has already paid borrowerCollateral

        if (currentTokenValue <= borrowerCollateral) {
            // Case 1: Current value <= borrower's collateral
            // Borrower overpaid, gets refund
            uint256 refund = borrowerCollateral - currentTokenValue;
            pyusdToken.safeTransfer(borrower, refund);

            // Lender gets current token value (from collateral)
            pyusdToken.safeTransfer(stakingPool, currentTokenValue);
            IStakingPool(stakingPool).repayToStake(lender, currentTokenValue);

        } else {
            // Case 2: Current value > borrower's collateral  
            // Borrower needs to pay more, comes from lender's stake
            uint256 shortfall = currentTokenValue - borrowerCollateral;

            // All collateral goes to lender
            pyusdToken.safeTransfer(stakingPool, borrowerCollateral);

            // Lender gets: borrowerCollateral + (original_stake - shortfall)
            // Which equals: borrowerCollateral + pyusdAmount - shortfall = currentTokenValue
            IStakingPool(stakingPool).repayToStake(lender, currentTokenValue);
        }

        state = State.COMPLETED;

        // Determine who benefited
        if (currentTokenValue < pyusdAmount) {
            emit Settled(borrower, pyusdAmount - currentTokenValue, false); // Borrower saved money
        } else if (currentTokenValue > pyusdAmount) {
            emit Settled(lender, currentTokenValue - pyusdAmount, true);    // Lender got more
        } else {
            emit Settled(address(0), 0, false); // Exact same value
        }

        // Refund excess ETH sent for price update
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }

    /// @notice Handle case when borrower defaults and doesn't settle
    function handleDefault() external {
        require(state == State.BORROWED, "Not in borrowed state");
        require(block.timestamp >= borrowTime + settlementTime + 7 days, "Too early"); // 7 day grace period
        
        // Report defaulting borrower
        IFutureEscrowFactory(factory).reportDefaultingBorrower(borrower);
        
        // Handle collateral - send to lender's stake
        IERC20(pyusd).safeTransfer(stakingPool, borrowerCollateral);
        IStakingPool(stakingPool).repayToStake(lender, borrowerCollateral);
        
        // Mark as defaulted
        state = State.DEFAULTED;
        
        emit DefaultHandled(borrower, pyusdAmount);
    }

    /// @dev Calculate PYUSD value of token amount using Pyth price - FIXED VERSION
    function _calculateTokenValueInPyusd(
        uint256 _tokenAmount,
        IPyth.Price memory priceData
    ) internal view returns (uint256) {
        uint256 price = uint256(int256(priceData.price));
        int32 expo = priceData.expo;
        
        // Get token decimals (assume 18 for ETH, 6 for USDC, etc.)
        uint8 tokenDecimals = _getTokenDecimals();
        uint8 pyusdDecimals = 6; // PYUSD has 6 decimals
        
        // Adjust price based on exponent
        uint256 priceAdjusted;
        if (expo >= 0) {
            priceAdjusted = price * (10 ** uint32(expo));
        } else {
            priceAdjusted = price / (10 ** uint32(-expo));
        }
        
        // Convert token amount to PYUSD value
        return (_tokenAmount * priceAdjusted * (10 ** pyusdDecimals)) / (10 ** tokenDecimals);
    }

    /// @dev Get token decimals (simplified)
    function _getTokenDecimals() internal view returns (uint8) {
        if (tokenAddress == address(0)) return 18; // ETH
        // For other tokens, you'd call token.decimals() if available
        return 18; // Default assumption
    }

    // View functions
    function getContractInfo() external view returns (
        State currentState,
        address currentBorrower,
        uint256 collateralAmount,
        uint64 remainingTime
    ) {
        currentState = state;
        currentBorrower = borrower;
        collateralAmount = borrowerCollateral;
        
        if (state == State.OPEN && block.timestamp < expireTime) {
            remainingTime = expireTime - uint64(block.timestamp);
        } else if (state == State.BORROWED && block.timestamp < borrowTime + settlementTime) {
            remainingTime = (borrowTime + settlementTime) - uint64(block.timestamp);
        } else {
            remainingTime = 0;
        }
    }

    // Emergency function to handle ETH payments
    receive() external payable {}
}