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

/// 1inch Router Interface (simplified)
interface IOneInchRouter {
    function swap(
        address srcToken,
        uint256 amount,
        uint256 minReturn,
        bytes calldata data
    ) external payable returns (uint256 returnAmount);
}

contract FutureEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { OPEN, BORROWED, COMPLETED, DEFAULTED }

    // Contract Configuration
    address public immutable lender;
    uint256 public immutable ethAmount;           // ETH amount lender deposits
    uint64 public immutable expireTime;          // Time until borrower can accept
    uint64 public immutable settlementTime;     // Duration after borrow until settlement

    // External Contracts
    address public immutable oneInchRouter;      // 1inch Router v6
    address public immutable pyusd;             // PYUSD token address
    address public immutable pyth;              // Pyth oracle contract
    bytes32 public immutable ethPriceId;        // ETH/USD Pyth price feed ID

    // State Variables
    State public state;
    address public borrower;
    uint64 public borrowTime;                    // When borrow() was called
    uint256 public pyusdGivenToBorrower;        // PYUSD amount given to borrower (now half of swap)
    uint256 public borrowerCollateral;          // PYUSD collateral from borrower

    // Events
    event Borrowed(address indexed borrower, uint256 pyusdReceived, uint256 collateralPosted);
    event Settled(address indexed winner, uint256 amount, bool lenderWon);

    constructor(
        address _lender,
        uint256 __ethAmount,
        uint64 _expireTime,
        uint64 _settlementTime,
        address _oneInchRouter,
        address _pyusd,
        address _pyth,
        bytes32 _ethPriceId
    ) payable {
        require(_lender != address(0) && __ethAmount > 0, "Invalid params");
        require(msg.value == __ethAmount, "Must deposit ETH amount");
        
        lender = _lender;
        ethAmount = __ethAmount;
        expireTime = _expireTime;
        settlementTime = _settlementTime;
        oneInchRouter = _oneInchRouter;
        pyusd = _pyusd;
        pyth = _pyth;
        ethPriceId = _ethPriceId;
        
        state = State.OPEN;
    }

    /// @notice Borrower accepts the offer by posting collateral and receiving PYUSD
    /// @param oneInchCalldata Calldata for 1inch to swap ETH -> PYUSD
    /// @param minPyusdOut Minimum PYUSD expected from swap
    function borrow(
        bytes calldata oneInchCalldata,
        uint256 minPyusdOut
    ) external payable nonReentrant {
        require(state == State.OPEN, "Not open");
        require(block.timestamp <= expireTime, "Offer expired");
        
        // 1. Swap lender's ETH to PYUSD using 1inch
        uint256 pyusdReceived = _swapEthToPyusd(ethAmount, oneInchCalldata, minPyusdOut);
        
        // 2. Calculate required borrower collateral (half of PYUSD value)
        uint256 requiredCollateral = pyusdReceived / 2;
        require(requiredCollateral > 0, "Invalid collateral");
        
        // 3. Transfer borrower's PYUSD collateral to contract (must have approved)
        IERC20(pyusd).safeTransferFrom(msg.sender, address(this), requiredCollateral);
        
        // 4. Give half of PYUSD to borrower, keep the other half in contract as escrow
        uint256 pyusdToBorrower = pyusdReceived / 2;
        IERC20(pyusd).safeTransfer(msg.sender, pyusdToBorrower);
        
        // 5. Update state
        borrower = msg.sender;
        borrowTime = uint64(block.timestamp);
        pyusdGivenToBorrower = pyusdToBorrower;
        borrowerCollateral = requiredCollateral;
        state = State.BORROWED;
        
        emit Borrowed(msg.sender, pyusdToBorrower, requiredCollateral);
    }

    /// @notice Settle the future contract using current ETH price
    /// @param priceUpdateData Pyth price update data
    function settle(bytes[] calldata priceUpdateData) external payable nonReentrant {
        require(state == State.BORROWED, "Not borrowed");
        require(block.timestamp >= borrowTime + settlementTime, "Too early");
        
        // 1. Update Pyth price feed
        uint256 fee = IPyth(pyth).getUpdateFee(priceUpdateData);
        require(msg.value >= fee, "Insufficient fee");
        IPyth(pyth).updatePriceFeeds{value: fee}(priceUpdateData);
        
        // 2. Get current ETH price from Pyth
        IPyth.Price memory priceData = IPyth(pyth).getPrice(ethPriceId);
        require(priceData.price > 0, "Invalid price");
        
        // 3. Calculate current PYUSD value of original ETH
        uint256 currentEthValueInPyusd = _calculateEthValueInPyusd(ethAmount, priceData);
        
        IERC20 pyusdToken = IERC20(pyusd);
        uint256 totalAvailable = pyusdToken.balanceOf(address(this)); // Remaining PYUSD in contract
        
        // 4. Determine settlement outcome
        if (currentEthValueInPyusd <= pyusdGivenToBorrower) {
            // Borrower wins: ETH value decreased, borrower keeps what they got
            // Transfer all remaining PYUSD to borrower
            if (totalAvailable > 0) {
                pyusdToken.safeTransfer(borrower, totalAvailable);
            }
            state = State.COMPLETED;
            emit Settled(borrower, totalAvailable, false);
        } else {
            // Lender wins: ETH value increased
            uint256 owedToLender = currentEthValueInPyusd - pyusdGivenToBorrower;
            
            if (totalAvailable >= owedToLender) {
                // Borrower can cover the difference (using contract PYUSD)
                pyusdToken.safeTransfer(lender, owedToLender);
                
                // Refund remaining to borrower
                uint256 remaining = totalAvailable - owedToLender;
                if (remaining > 0) {
                    pyusdToken.safeTransfer(borrower, remaining);
                }
                state = State.COMPLETED;
                emit Settled(lender, owedToLender, true);
            } else {
                // Borrower defaults: give all remaining to lender
                if (totalAvailable > 0) {
                    pyusdToken.safeTransfer(lender, totalAvailable);
                }
                state = State.DEFAULTED;
                emit Settled(lender, totalAvailable, true);
            }
        }
        
        // Refund excess ETH sent for price update
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }

    /// @dev Swap ETH to PYUSD using 1inch
    function _swapEthToPyusd(
        uint256 ethAmountIn,
        bytes calldata oneInchCalldata,
        uint256 minPyusdOut
    ) internal returns (uint256 pyusdReceived) {
        uint256 pyusdBefore = IERC20(pyusd).balanceOf(address(this));
        
        // Call 1inch router to swap ETH -> PYUSD
        (bool success, ) = oneInchRouter.call{value: ethAmountIn}(oneInchCalldata);
        require(success, "1inch swap failed");
        
        uint256 pyusdAfter = IERC20(pyusd).balanceOf(address(this));
        pyusdReceived = pyusdAfter - pyusdBefore;
        require(pyusdReceived >= minPyusdOut, "Insufficient output");
        
        return pyusdReceived;
    }

    /// @dev Calculate PYUSD value of ETH amount using Pyth price
    function _calculateEthValueInPyusd(
        uint256 _ethAmount,
        IPyth.Price memory priceData
    ) internal pure returns (uint256) {
        // Pyth price is in format: price * 10^expo
        // ETH has 18 decimals, PYUSD has 6 decimals
        
        uint256 price = uint256(int256(priceData.price));
        int32 expo = priceData.expo;
        
        // Convert ETH (18 decimals) to PYUSD (6 decimals) using price
        if (expo >= 0) {
            return ( _ethAmount * price * (10 ** uint32(expo)) ) / 1e18 / 1e12; // Adjust for PYUSD decimals
        } else {
            return ( _ethAmount * price ) / (10 ** uint32(-expo)) / 1e18 / 1e12;
        }
    }

    // View functions
    function getContractBalance() external view returns (uint256 ethBalance, uint256 pyusdBalance) {
        return (address(this).balance, IERC20(pyusd).balanceOf(address(this)));
    }

    // Fallback to receive ETH
    receive() external payable {}
}
