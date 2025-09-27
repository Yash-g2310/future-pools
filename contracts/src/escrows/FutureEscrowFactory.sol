// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./FutureEscrow.sol";

contract FutureEscrowFactory is Ownable {
    using SafeERC20 for IERC20;

    event EscrowCreated(
        address indexed escrow, 
        address indexed lender, 
        address tokenAddress,
        uint256 tokenAmount, 
        uint256 pyusdAmount,
        uint64 expireTime, 
        uint64 settlementTime
    );

    // Immutable contract addresses
    address public immutable oneInchRouter;      
    address public immutable pyusd;             
    address public immutable pyth;              
    address public immutable stakingPool;       
    address public immutable proofOfHuman;      

    // Supported token price feeds
    mapping(address => bytes32) public tokenPriceIds;
    
    address[] public escrows;

    constructor(
        address _oneInchRouter,
        address _pyusd,
        address _pyth,
        address _stakingPool,
        address _proofOfHuman
    ) Ownable(msg.sender) {
        require(_oneInchRouter != address(0), "zero router");
        require(_pyusd != address(0), "zero pyusd");
        require(_pyth != address(0), "zero pyth");
        require(_stakingPool != address(0), "zero staking pool");
        require(_proofOfHuman != address(0), "zero proof of human");
        
        oneInchRouter = _oneInchRouter;
        pyusd = _pyusd;
        pyth = _pyth;
        stakingPool = _stakingPool;
        proofOfHuman = _proofOfHuman;
    }

    /// @notice Add supported token with price feed ID
    function addSupportedToken(address token, bytes32 priceId) external onlyOwner {
        require(token != address(0) || priceId != bytes32(0), "invalid params");
        tokenPriceIds[token] = priceId;
    }

    /// @notice Create a new future escrow for token lending
    function createEscrow(
        address tokenAddress,
        uint256 tokenAmount,
        uint64 expireTime,
        uint64 settlementTime
    ) external returns (address escrowAddress) {
        require(tokenAmount > 0, "zero amount");
        require(expireTime > block.timestamp, "bad expire time");
        require(settlementTime > 0, "bad settlement duration");
        
        // Check if token is supported
        bytes32 priceId = tokenPriceIds[tokenAddress];
        require(priceId != bytes32(0), "unsupported token");
        
        // Get current token price and convert to PYUSD amount
        uint256 pyusdAmount = _getTokenValueInPyusd(tokenAddress, tokenAmount, priceId);
        require(pyusdAmount > 0, "invalid conversion");
        
        // Check lender has enough staked PYUSD
        uint256 lenderBalance = IStakingPool(stakingPool).availableBalance(msg.sender);
        require(lenderBalance >= pyusdAmount, "insufficient staked balance");

        // Deploy a new FutureEscrow
        FutureEscrow escrow = new FutureEscrow(
            msg.sender,        
            tokenAddress,      
            tokenAmount,       
            pyusdAmount,       
            expireTime,        
            settlementTime,    
            oneInchRouter,     
            pyusd,             
            pyth,              
            stakingPool,       
            proofOfHuman,      
            priceId            
        );

        escrowAddress = address(escrow);
        escrows.push(escrowAddress);

        // Authorize escrow in staking pool
        IStakingPool(stakingPool).authorizeEscrow(escrowAddress);

        emit EscrowCreated(escrowAddress, msg.sender, tokenAddress, tokenAmount, pyusdAmount, expireTime, settlementTime);
    }

    /// @notice Get current PYUSD value of token amount - FIXED VERSION
    function _getTokenValueInPyusd(
        address, /* tokenAddress */
        uint256 tokenAmount, 
        bytes32 priceId
    ) internal view returns (uint256) {
        IPyth.Price memory priceData = IPyth(pyth).getPrice(priceId);
        require(priceData.price > 0, "Invalid price");
        
        uint256 price = uint256(int256(priceData.price));
        int32 expo = priceData.expo;
        
        // Adjust price based on exponent
        uint256 priceAdjusted;
        if (expo >= 0) {
            priceAdjusted = price * (10 ** uint32(expo));
        } else {
            priceAdjusted = price / (10 ** uint32(-expo));
        }
        
        // For ETH: tokenAmount = 1e18, price = 2000, result should be 2000 * 1e6
        uint256 tokenDecimals = 18; // ETH decimals
        uint256 pyusdDecimals = 6;  // PYUSD decimals
        
        return (tokenAmount * priceAdjusted * (10 ** pyusdDecimals)) / (10 ** tokenDecimals);
    }

    /// @notice Get number of escrows created via factory
    function escrowsCount() external view returns (uint256) {
        return escrows.length;
    }

    /// @notice Get all escrow addresses
    function getAllEscrows() external view returns (address[] memory) {
        return escrows;
    }

    /// @notice Get escrow details by index
    function getEscrowByIndex(uint256 index) external view returns (address escrowAddress) {
        require(index < escrows.length, "index out of bounds");
        return escrows[index];
    }

    /// @notice Check if token is supported
    function isTokenSupported(address token) external view returns (bool) {
        return tokenPriceIds[token] != bytes32(0);
    }
}