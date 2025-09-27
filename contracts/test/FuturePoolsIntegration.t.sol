// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

// Import your contracts with specific names to avoid conflicts
import {StakingPool} from "../src/StakingPool.sol";
import {FutureEscrowFactory} from "../src/escrows/FutureEscrowFactory.sol";
import {FutureEscrow} from "../src/escrows/FutureEscrow.sol";
import {ProofOfHumanWithBlacklist} from "../src/self/NewProofOfHumanWithBlackList.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

// Mock contracts for testing
contract MockPYUSD is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply = 1000000 * 10**6; // 1M PYUSD
    string public name = "Mock PYUSD";
    string public symbol = "PYUSD";
    uint8 public decimals = 6;

    constructor() {
        _balances[msg.sender] = _totalSupply;
    }

    function totalSupply() external view override returns (uint256) { return _totalSupply; }
    function balanceOf(address account) external view override returns (uint256) { return _balances[account]; }
    function allowance(address owner, address spender) external view override returns (uint256) { return _allowances[owner][spender]; }

    function transfer(address to, uint256 amount) external override returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        require(_balances[from] >= amount, "Insufficient balance");
        
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    // Helper for testing
    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        _totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }
}

contract MockPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }

    mapping(bytes32 => Price) public prices;

    function setPrice(bytes32 id, int64 price, int32 expo) external {
        prices[id] = Price({
            price: price,
            conf: 0,
            expo: expo,
            publishTime: uint64(block.timestamp)
        });
    }

    function getPrice(bytes32 id) external view returns (Price memory) {
        require(prices[id].price > 0, "Price not set");
        return prices[id];
    }

    function updatePriceFeeds(bytes[] calldata) external payable {
        // Mock implementation - does nothing
    }
    
    function getUpdateFee(bytes[] calldata) external pure returns (uint256) { 
        return 0; // No fee for testing
    }
}

// Mock Self Protocol dependencies
contract MockIdentityHub {
    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory
    ) external pure returns (bytes32) {
        return keccak256("mock_config");
    }
}

contract FuturePoolsIntegrationTest is Test {
    // Main contracts
    StakingPool stakingPool;
    FutureEscrowFactory factory;
    ProofOfHumanWithBlacklist proofOfHuman;
    
    // Mock contracts
    MockPYUSD pyusd;
    MockPyth pyth;
    MockIdentityHub identityHub;
    
    // Test addresses
    address lender = address(0x1);
    address borrower = address(0x2);
    address admin = address(this);
    
    // Constants
    uint256 constant INITIAL_BALANCE = 10000 * 10**6; // 10,000 PYUSD
    bytes32 constant ETH_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    address constant ETH_ADDRESS = address(0); // ETH represented as address(0)

    function setUp() public {
        console.log("=== SETTING UP TESTS ===");
        
        // Deploy mock contracts
        pyusd = new MockPYUSD();
        pyth = new MockPyth();
        identityHub = new MockIdentityHub();
        
        console.log("Mock contracts deployed");
        
        // Set ETH price: $2000 (with -8 exponent)
        pyth.setPrice(ETH_PRICE_ID, 2000 * 10**8, -8);
        console.log("ETH price set to $2000");
        
        // Deploy main contracts
        stakingPool = new StakingPool(address(pyusd));
        console.log("StakingPool deployed at:", address(stakingPool));
        
        // Create verification config for ProofOfHuman
        SelfUtils.UnformattedVerificationConfigV2 memory config = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: new string[](0),
            ofacEnabled: false
        });
        
        proofOfHuman = new ProofOfHumanWithBlacklist(
            address(identityHub),
            "future-pools-test",
            config
        );
        console.log("ProofOfHuman deployed at:", address(proofOfHuman));
        
        factory = new FutureEscrowFactory(
            address(0x123), // Mock 1inch
            address(pyusd),
            address(pyth),
            address(stakingPool),
            address(proofOfHuman)
        );
        console.log("Factory deployed at:", address(factory));
        
        // Setup permissions
        stakingPool.setFactory(address(factory));
        factory.addSupportedToken(ETH_ADDRESS, ETH_PRICE_ID);
        console.log("Permissions and tokens configured");
        
        // Setup test balances
        pyusd.mint(lender, INITIAL_BALANCE);
        pyusd.mint(borrower, INITIAL_BALANCE);
        pyusd.mint(admin, INITIAL_BALANCE);
        console.log("Test balances minted");
        
        // Verify test users
        proofOfHuman.manuallyVerifyUser(lender, 12345);
        proofOfHuman.manuallyVerifyUser(borrower, 67890);
        console.log("Test users verified");
        
        console.log("=== SETUP COMPLETE ===\n");
    }

    function test_01_ContractDeployment() public view {
        console.log("TEST 1: Contract Deployment");
        
        // Check all contracts exist
        assertTrue(address(stakingPool) != address(0), "StakingPool not deployed");
        assertTrue(address(factory) != address(0), "Factory not deployed");
        assertTrue(address(proofOfHuman) != address(0), "ProofOfHuman not deployed");
        assertTrue(address(pyusd) != address(0), "PYUSD not deployed");
        
        // Check factory configuration
        assertEq(factory.stakingPool(), address(stakingPool), "Factory has wrong StakingPool");
        assertEq(factory.proofOfHuman(), address(proofOfHuman), "Factory has wrong ProofOfHuman");
        assertEq(factory.pyusd(), address(pyusd), "Factory has wrong PYUSD");
        
        // Check staking pool configuration
        assertEq(stakingPool.factory(), address(factory), "StakingPool has wrong factory");
        assertEq(address(stakingPool.pyusd()), address(pyusd), "StakingPool has wrong PYUSD");
        
        console.log("All contracts deployed correctly");
    }

    function test_02_ProofOfHumanFunctionality() public {
        console.log("TEST 2: ProofOfHuman Functionality");
        
        address testUser = address(0x999);
        
        // Initially not verified
        assertFalse(proofOfHuman.isVerified(testUser), "User should not be verified initially");
        
        // Manually verify user
        proofOfHuman.manuallyVerifyUser(testUser, 99999);
        assertTrue(proofOfHuman.isVerified(testUser), "User should be verified after manual verification");
        assertEq(proofOfHuman.getUserIdentifier(testUser), 99999, "User identifier should match");
        
        // Blacklist user
        proofOfHuman.blacklistUser(testUser);
        assertFalse(proofOfHuman.isVerified(testUser), "User should not be verified after blacklisting");
        assertTrue(proofOfHuman.isUserBlacklisted(testUser), "User should be marked as blacklisted");
        
        console.log("ProofOfHuman functionality works correctly");
    }

    function test_03_StakingPoolBasics() public {
        console.log("TEST 3: StakingPool Basic Functionality");
        
        uint256 stakeAmount = 1000 * 10**6; // 1,000 PYUSD
        
        // Lender stakes PYUSD
        vm.startPrank(lender);
        pyusd.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount);
        vm.stopPrank();
        
        // Check balances
        assertEq(stakingPool.stakedBalance(lender), stakeAmount, "Staked balance incorrect");
        assertEq(stakingPool.availableBalance(lender), stakeAmount, "Available balance incorrect");
        assertEq(stakingPool.totalStaked(), stakeAmount, "Total staked incorrect");
        assertEq(pyusd.balanceOf(address(stakingPool)), stakeAmount, "Pool PYUSD balance incorrect");
        
        // Check user balance info
        (uint256 staked, uint256 locked, uint256 available) = stakingPool.getUserBalance(lender);
        assertEq(staked, stakeAmount, "getUserBalance staked incorrect");
        assertEq(locked, 0, "getUserBalance locked should be 0");
        assertEq(available, stakeAmount, "getUserBalance available incorrect");
        
        console.log("Staking pool basic functionality works");
    }

    function test_04_EscrowCreation() public {
        console.log("TEST 4: Escrow Creation");
        
        uint256 stakeAmount = 3000 * 10**6; // 3,000 PYUSD
        uint256 tokenAmount = 1 ether; // 1 ETH
        
        // Lender stakes PYUSD first
        vm.startPrank(lender);
        pyusd.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount);
        
        // Create escrow
        uint64 expireTime = uint64(block.timestamp + 1 hours);
        uint64 settlementTime = uint64(2 hours);
        
        address payable escrowAddress = payable(factory.createEscrow(
            ETH_ADDRESS,
            tokenAmount,
            expireTime,
            settlementTime
        ));
        vm.stopPrank();
        
        // Check escrow was created
        assertTrue(escrowAddress != address(0), "Escrow address should not be zero");
        assertTrue(stakingPool.authorizedEscrows(escrowAddress), "Escrow should be authorized");
        assertEq(factory.escrowsCount(), 1, "Factory should have 1 escrow");
        
        // Check escrow configuration
        FutureEscrow escrow = FutureEscrow(escrowAddress);
        assertEq(escrow.lender(), lender, "Escrow lender incorrect");
        assertEq(escrow.tokenAddress(), ETH_ADDRESS, "Escrow token address incorrect");
        assertEq(escrow.tokenAmount(), tokenAmount, "Escrow token amount incorrect");
        assertEq(escrow.expireTime(), expireTime, "Escrow expire time incorrect");
        assertEq(escrow.settlementTime(), settlementTime, "Escrow settlement time incorrect");
        assertEq(uint(escrow.state()), uint(FutureEscrow.State.OPEN), "Escrow should be OPEN");
        
        // Check PYUSD amount calculation (1 ETH at $2000 = 2000 PYUSD)
        uint256 expectedPyusdAmount = 2000 * 10**6; // 2000 PYUSD with 6 decimals
        assertEq(escrow.pyusdAmount(), expectedPyusdAmount, "PYUSD amount calculation incorrect");
        
        console.log("SUCCESS: Escrow creation works correctly");
        console.log("Escrow PYUSD Amount:", escrow.pyusdAmount());
    }

    function test_05_BorrowFlow() public {
        console.log("TEST 5: Borrow Flow");
        
        uint256 stakeAmount = 3000 * 10**6; // 3,000 PYUSD
        uint256 tokenAmount = 1 ether; // 1 ETH
        
        // Setup: Lender stakes and creates escrow
        vm.startPrank(lender);
        pyusd.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount);
        
        address payable escrowAddress = payable(factory.createEscrow(
            ETH_ADDRESS,
            tokenAmount,
            uint64(block.timestamp + 1 hours),
            uint64(2 hours)
        ));
        vm.stopPrank();
        
        FutureEscrow escrow = FutureEscrow(escrowAddress);
        uint256 pyusdAmount = escrow.pyusdAmount();
        uint256 requiredCollateral = pyusdAmount / 2;
        
        console.log("PYUSD Amount:", pyusdAmount);
        console.log("Required Collateral:", requiredCollateral);
        
        // Check balances before borrow
        uint256 borrowerInitialBalance = pyusd.balanceOf(borrower);
        uint256 lenderAvailableBalance = stakingPool.availableBalance(lender);
        
        // Borrower borrows from escrow
        vm.startPrank(borrower);
        pyusd.approve(address(escrow), requiredCollateral);
        escrow.borrow(requiredCollateral);
        vm.stopPrank();
        
        // Check state after borrow
        assertEq(uint(escrow.state()), uint(FutureEscrow.State.BORROWED), "Escrow should be BORROWED");
        assertEq(escrow.borrower(), borrower, "Borrower should be set");
        assertEq(escrow.borrowerCollateral(), requiredCollateral, "Borrower collateral should be set");
        
        // Check balances after borrow
        assertEq(
            pyusd.balanceOf(borrower), 
            borrowerInitialBalance + pyusdAmount - requiredCollateral,
            "Borrower balance should increase by net amount"
        );
        assertEq(
            stakingPool.availableBalance(lender),
            lenderAvailableBalance - pyusdAmount,
            "Lender available balance should decrease"
        );
        assertEq(
            stakingPool.lockedBalance(lender),
            pyusdAmount,
            "Lender locked balance should equal loan amount"
        );
        
        console.log("SUCCESS: Borrow flow works correctly");
    }

    function test_06_SettlementBorrowerWins() public {
        console.log("TEST 6: Settlement - Borrower Wins (Price Decreases)");
        
        // Setup escrow and borrow
        address payable escrowAddress = _setupEscrowAndBorrow();
        FutureEscrow escrow = FutureEscrow(escrowAddress);
        
        uint256 pyusdAmount = escrow.pyusdAmount(); // 2000 PYUSD
        uint256 collateral = escrow.borrowerCollateral(); // 1000 PYUSD
        
        // Wait for settlement time
        vm.warp(block.timestamp + 3 hours);
        
        // Change ETH price to $1500 (borrower wins - price decreased)
        pyth.setPrice(ETH_PRICE_ID, 1500 * 10**8, -8);
        
        // Get initial balances
        uint256 borrowerBalanceBefore = pyusd.balanceOf(borrower);
        uint256 lenderStakedBefore = stakingPool.stakedBalance(lender);
        
        // Settle the contract
        bytes[] memory priceUpdateData = new bytes[](0);
        escrow.settle(priceUpdateData);
        
        // Check final state
        assertEq(uint(escrow.state()), uint(FutureEscrow.State.COMPLETED), "Should be COMPLETED");
        
        // Current token value: 1 ETH = 1500 PYUSD
        uint256 currentValue = 1500 * 10**6; // 1500 PYUSD
        
        // Borrower should get refund: collateral - currentValue = 1000 - 1500 = -500
        // Since currentValue > collateral, borrower gets no refund
        assertEq(
            pyusd.balanceOf(borrower),
            borrowerBalanceBefore, // No change, no refund
            "Borrower should get no refund when current value > collateral"
        );
        
        // Lender should get currentValue = 1500 PYUSD (less than their original 2000)
        // Original stake was 2000, but they only get back 1500
        uint256 expectedLenderStake = lenderStakedBefore - (pyusdAmount - currentValue);
        assertEq(
            stakingPool.stakedBalance(lender),
            expectedLenderStake,
            "Lender should get current token value (1500 PYUSD)"
        );
        
        console.log("SUCCESS: Settlement with borrower winning works correctly");
        console.log("Lender lost:", pyusdAmount - currentValue, "PYUSD");
    }
    
    function test_07_SettlementLenderWins() public {
        console.log("TEST 7: Settlement - Lender Wins (Price Increases)");
        
        // Setup escrow and borrow  
        address payable escrowAddress = _setupEscrowAndBorrow();
        FutureEscrow escrow = FutureEscrow(escrowAddress);
        
        uint256 pyusdAmount = escrow.pyusdAmount(); // 2000 PYUSD
        uint256 collateral = escrow.borrowerCollateral(); // 1000 PYUSD
        
        // Wait for settlement time
        vm.warp(block.timestamp + 3 hours);
        
        // Change ETH price to $2500 (lender wins - price increased)
        pyth.setPrice(ETH_PRICE_ID, 2500 * 10**8, -8);
        
        // Get initial balances
        uint256 borrowerBalanceBefore = pyusd.balanceOf(borrower);
        uint256 lenderStakedBefore = stakingPool.stakedBalance(lender);
        
        // Settle the contract
        bytes[] memory priceUpdateData = new bytes[](0);
        escrow.settle(priceUpdateData);
        
        // Check final state
        assertEq(uint(escrow.state()), uint(FutureEscrow.State.COMPLETED), "Should be COMPLETED");
        
        // Current token value: 1 ETH = 2500 PYUSD  
        uint256 currentValue = 2500 * 10**6; // 2500 PYUSD
        
        // Borrower pays currentValue (2500) from their collateral (1000) + lender's stake (1500)
        // Borrower should get no refund since they owe more than their collateral
        assertEq(
            pyusd.balanceOf(borrower),
            borrowerBalanceBefore,
            "Borrower should get no refund"
        );
        
        // Lender should get currentValue = 2500 PYUSD (more than their original 2000)
        uint256 profit = currentValue - pyusdAmount; // 500 PYUSD profit
        assertEq(
            stakingPool.stakedBalance(lender),
            lenderStakedBefore + profit,
            "Lender should get current token value (2500 PYUSD)"
        );
        
        console.log("SUCCESS: Settlement with lender winning works correctly");
        console.log("Lender gained:", profit, "PYUSD");
    }

    function test_08_VerificationRequirement() public {
        console.log("TEST 8: Verification Requirement");
        
        uint256 stakeAmount = 2000 * 10**6;
        uint256 tokenAmount = 1 ether;
        
        // Setup escrow
        vm.startPrank(lender);
        pyusd.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount);
        
        address payable escrowAddress = payable(factory.createEscrow(
            ETH_ADDRESS,
            tokenAmount,
            uint64(block.timestamp + 1 hours),
            uint64(2 hours)
        ));
        vm.stopPrank();
        
        FutureEscrow escrow = FutureEscrow(escrowAddress);
        uint256 requiredCollateral = escrow.pyusdAmount() / 2;
        
        // Create unverified user
        address unverifiedUser = address(0x999);
        pyusd.mint(unverifiedUser, requiredCollateral);
        
        // Unverified user should not be able to borrow
        vm.startPrank(unverifiedUser);
        pyusd.approve(address(escrow), requiredCollateral);
        vm.expectRevert("Not verified");
        escrow.borrow(requiredCollateral);
        vm.stopPrank();
        
        console.log("SUCCESS: Verification requirement works correctly");
    }

    function test_09_EdgeCasesAndErrors() public {
        console.log("TEST 9: Edge Cases and Error Handling");
        
        // Test zero stake amount
        vm.expectRevert("Amount must be > 0");
        stakingPool.stake(0);
        
        // Test unstaking more than staked
        vm.prank(address(0x999));
        vm.expectRevert("Insufficient staked balance");
        stakingPool.unstake(1000);
        
        // Test creating escrow with unsupported token
        vm.startPrank(lender);
        pyusd.approve(address(stakingPool), 1000 * 10**6);
        stakingPool.stake(1000 * 10**6);
        
        vm.expectRevert("unsupported token");
        factory.createEscrow(
            address(0x456), // Unsupported token
            1 ether,
            uint64(block.timestamp + 1 hours),
            uint64(2 hours)
        );
        vm.stopPrank();
        
        console.log("SUCCESS: Edge cases and error handling work correctly");
    }

    // Helper function to set up escrow and borrow
    function _setupEscrowAndBorrow() internal returns (address payable escrowAddress) {
        uint256 stakeAmount = 3000 * 10**6;
        uint256 tokenAmount = 1 ether;
        
        // Lender stakes and creates escrow
        vm.startPrank(lender);
        pyusd.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount);
        
        escrowAddress = payable(factory.createEscrow(
            ETH_ADDRESS,
            tokenAmount,
            uint64(block.timestamp + 1 hours),
            uint64(2 hours)
        ));
        vm.stopPrank();
        
        // Borrower borrows
        FutureEscrow escrow = FutureEscrow(escrowAddress);
        uint256 requiredCollateral = escrow.pyusdAmount() / 2;
        
        vm.startPrank(borrower);
        pyusd.approve(address(escrow), requiredCollateral);
        escrow.borrow(requiredCollateral);
        vm.stopPrank();
    }

    function test_10_CompleteIntegration() public {
        console.log("TEST 10: Complete Integration Test");
        
        console.log("Starting complete flow test...");
        
        // 1. Multiple users stake
        address user1 = address(0x100);
        address user2 = address(0x200);
        
        pyusd.mint(user1, 5000 * 10**6);
        pyusd.mint(user2, 3000 * 10**6);
        
        proofOfHuman.manuallyVerifyUser(user1, 111);
        proofOfHuman.manuallyVerifyUser(user2, 222);
        
        // Users stake
        vm.prank(user1);
        pyusd.approve(address(stakingPool), 5000 * 10**6);
        vm.prank(user1);
        stakingPool.stake(5000 * 10**6);
        
        vm.prank(user2);
        pyusd.approve(address(stakingPool), 3000 * 10**6);
        vm.prank(user2);
        stakingPool.stake(3000 * 10**6);
        
        // 2. Create multiple escrows
        vm.prank(user1);
        address escrow1 = factory.createEscrow(ETH_ADDRESS, 1 ether, uint64(block.timestamp + 1 hours), uint64(1 hours));
        
        vm.prank(user2);
        address escrow2 = factory.createEscrow(ETH_ADDRESS, 0.5 ether, uint64(block.timestamp + 2 hours), uint64(1 hours));
        
        // 3. Borrowers accept contracts
        FutureEscrow contract1 = FutureEscrow(payable(escrow1));
        FutureEscrow contract2 = FutureEscrow(payable(escrow2));
        
        vm.startPrank(borrower);
        pyusd.approve(address(contract1), contract1.pyusdAmount() / 2);
        contract1.borrow(contract1.pyusdAmount() / 2);
        
        pyusd.approve(address(contract2), contract2.pyusdAmount() / 2);
        contract2.borrow(contract2.pyusdAmount() / 2);
        vm.stopPrank();
        
        // 4. Check system state
        assertEq(factory.escrowsCount(), 2, "Should have 2 escrows");
        assertTrue(stakingPool.lockedBalance(user1) > 0, "User1 should have locked balance");
        assertTrue(stakingPool.lockedBalance(user2) > 0, "User2 should have locked balance");
        
        console.log("SUCCESS: Complete integration test passed");
        console.log("Total escrows created:", factory.escrowsCount());
        console.log("Total PYUSD staked:", stakingPool.totalStaked());
        console.log("Total PYUSD locked:", stakingPool.totalLocked());
    }
}