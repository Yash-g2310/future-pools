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
        uint256 ethAmount, 
        uint64 expireTime, 
        uint64 settlementTime
    );

    // Immutable contract addresses
    address public immutable oneInchRouter;  // 1inch Router v6
    address public immutable pyusd;          // PYUSD token address
    address public immutable pyth;           // Pyth oracle contract
    bytes32 public immutable ethPriceId;     // ETH/USD Pyth price feed ID

    address[] public escrows;

    // NOTE: call Ownable(msg.sender) to set the factory owner to the deployer.
    constructor(
        address _oneInchRouter,
        address _pyusd,
        address _pyth,
        bytes32 _ethPriceId
    ) Ownable(msg.sender) {
        require(_oneInchRouter != address(0), "zero router");
        require(_pyusd != address(0), "zero pyusd");
        require(_pyth != address(0), "zero pyth");
        require(_ethPriceId != bytes32(0), "zero price id");
        
        oneInchRouter = _oneInchRouter;
        pyusd = _pyusd;
        pyth = _pyth;
        ethPriceId = _ethPriceId;
    }

    /// @notice Create a new ETH future escrow and deposit lender's ETH into it
    /// @param ethAmount Amount of ETH lender wants to deposit
    /// @param expireTime Timestamp until which borrower can accept the offer
    /// @param settlementTime Duration (in seconds) after borrow until settlement
    function createEscrow(
        uint256 ethAmount,
        uint64 expireTime,
        uint64 settlementTime
    ) external payable returns (address escrowAddress) {
        require(ethAmount > 0, "zero amount");
        require(msg.value == ethAmount, "ETH amount mismatch");
        require(expireTime >= block.timestamp, "bad expire time");
        require(settlementTime > 0, "bad settlement duration");

        // Deploy a new FutureEscrow with ETH deposit
        FutureEscrow escrow = new FutureEscrow{value: ethAmount}(
            msg.sender,        // lender
            ethAmount,         // ETH amount
            expireTime,        // expire time
            settlementTime,    // settlement duration (pass duration, not absolute timestamp)
            oneInchRouter,     // 1inch router
            pyusd,             // PYUSD token
            pyth,              // Pyth oracle
            ethPriceId         // ETH price feed ID
        );

        escrowAddress = address(escrow);
        escrows.push(escrowAddress);

        emit EscrowCreated(escrowAddress, msg.sender, ethAmount, expireTime, settlementTime);
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
}