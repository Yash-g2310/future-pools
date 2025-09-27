// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./FutureEscrow.sol";
import "../self/PassportVerifier.sol";

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
    
    event DefaultReported(address indexed borrower, address indexed escrow);

    // Immutable contract addresses          
    address public immutable pyusd;             
    address public immutable pyth;              
    address public immutable stakingPool;       
    address public immutable proofOfHuman;      // This points to PassportVerifier

    // Supported token price feeds
    mapping(address => bytes32) public tokenPriceIds;
    
    address[] public escrows;
    mapping(address => bool) public authorizedEscrows;

    constructor(
        address _pyusd,
        address _pyth,
        address _stakingPool,
        address _passportVerifier
    ) Ownable(msg.sender) {
        require(_pyusd != address(0), "zero pyusd");
        require(_pyth != address(0), "zero pyth");
        require(_stakingPool != address(0), "zero staking pool");
        require(_passportVerifier != address(0), "zero passport verifier");
        
        pyusd = _pyusd;
        pyth = _pyth;
        stakingPool = _stakingPool;
        proofOfHuman = _passportVerifier;
        
        // Request role in PassportVerifier
        PassportVerifier(_passportVerifier).grantRole(
            PassportVerifier(_passportVerifier).ESCROW_FACTORY_ROLE(),
            address(this)
        );
    }

    /// @notice Report a defaulting borrower
    function reportDefaultingBorrower(address borrower) external {
        require(authorizedEscrows[msg.sender], "Not an authorized escrow");
        
        // Report default to PassportVerifier
        PassportVerifier(proofOfHuman).reportDefault(borrower);
        
        emit DefaultReported(borrower, msg.sender);
    }

    /// @notice Add supported token with price feed ID
    function addSupportedToken(address token, bytes32 priceId) external onlyOwner {
        require(token != address(0) && priceId != bytes32(0), "invalid params");
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

        // Deploy a new FutureEscrow (removed oneInchRouter)
        FutureEscrow escrow = new FutureEscrow(
            msg.sender,        // lender
            tokenAddress,      
            tokenAmount,       
            pyusdAmount,       
            expireTime,        
            settlementTime,    
            pyusd,             
            pyth,              
            stakingPool,       
            proofOfHuman,      
            address(this),     // factory
            priceId            
        );

        escrowAddress = address(escrow);
        escrows.push(escrowAddress);
        authorizedEscrows[escrowAddress] = true;

        // Authorize escrow in staking pool
        IStakingPool(stakingPool).authorizeEscrow(escrowAddress);

        emit EscrowCreated(escrowAddress, msg.sender, tokenAddress, tokenAmount, pyusdAmount, expireTime, settlementTime);
    }

    /// @notice Get total escrows created
    function getEscrowCount() external view returns (uint256) {
        return escrows.length;
    }

    /// @notice Calculate token value in PYUSD using Pyth oracle
    function _getTokenValueInPyusd(
        address token, 
        uint256 amount,
        bytes32 priceId
    ) internal view returns (uint256) {
        IPyth.Price memory priceData = IPyth(pyth).getPrice(priceId);
        require(priceData.price > 0, "Invalid price");
        
        uint256 price = uint256(int256(priceData.price));
        int32 expo = priceData.expo;
        
        // Get token decimals (simplified)
        uint8 tokenDecimals = 18;  // Default for most tokens
        uint8 pyusdDecimals = 6;   // PYUSD decimals
        
        // Adjust price based on exponent
        uint256 priceAdjusted;
        if (expo >= 0) {
            priceAdjusted = price * (10 ** uint32(expo));
        } else {
            priceAdjusted = price / (10 ** uint32(-expo));
        }
        
        // Calculate PYUSD amount
        return (amount * priceAdjusted * (10 ** pyusdDecimals)) / (10 ** tokenDecimals);
    }
}