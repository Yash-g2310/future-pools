// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/StakingPool.sol";
import "../src/escrows/FutureEscrowFactory.sol";  
import "../src/self/NewProofOfHumanWithBlackList.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";

// Import IERC20 from the same path as your main contracts
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Simple mock contracts - minimal to avoid conflicts
contract MockPYUSD {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply = 1000000 * 10**6;
    
    string public name = "Mock PYUSD";
    string public symbol = "PYUSD"; 
    uint8 public decimals = 6;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        _balances[msg.sender] = _totalSupply;
    }

    function totalSupply() external view returns (uint256) { return _totalSupply; }
    function balanceOf(address account) external view returns (uint256) { return _balances[account]; }
    function allowance(address owner, address spender) external view returns (uint256) { return _allowances[owner][spender]; }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        require(_balances[from] >= amount, "Insufficient balance");
        
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), to, amount);
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

    function updatePriceFeeds(bytes[] calldata) external payable {}
    function getUpdateFee(bytes[] calldata) external pure returns (uint256) { return 0; }
}

contract MockIdentityHub {
    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory
    ) external pure returns (bytes32) {
        return keccak256("mock_config");
    }
}

contract DeployLocalScript is Script {
    function run() external {
        // Use anvil's default first account
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== DEPLOYING FUTURE POOLS LOCALLY ===");
        console.log("Deployer:", deployer);

        // Deploy mocks
        MockPYUSD pyusd = new MockPYUSD();
        console.log("MockPYUSD deployed at:", address(pyusd));

        MockPyth pyth = new MockPyth();
        console.log("MockPyth deployed at:", address(pyth));

        MockIdentityHub identityHub = new MockIdentityHub();
        console.log("MockIdentityHub deployed at:", address(identityHub));

        // Set ETH price to $2000
        pyth.setPrice(
            0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace, 
            2000 * 10**8, 
            -8
        );
        console.log("ETH price set to $2000");

        // Deploy main contracts
        StakingPool stakingPool = new StakingPool(address(pyusd));
        console.log("StakingPool deployed at:", address(stakingPool));

        SelfUtils.UnformattedVerificationConfigV2 memory config = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: new string[](0),
            ofacEnabled: false
        });

        ProofOfHumanWithBlacklist proofOfHuman = new ProofOfHumanWithBlacklist(
            address(identityHub),
            "future-pools-local",
            config
        );
        console.log("ProofOfHuman deployed at:", address(proofOfHuman));

        FutureEscrowFactory factory = new FutureEscrowFactory(
            address(0x1234567890123456789012345678901234567890), // Mock 1inch
            address(pyusd),
            address(pyth),
            address(stakingPool),
            address(proofOfHuman)
        );
        console.log("Factory deployed at:", address(factory));

        // Configure contracts
        stakingPool.setFactory(address(factory));
        factory.addSupportedToken(address(0), 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace);

        // Setup test accounts
        address testUser1 = address(0x1);
        address testUser2 = address(0x2);
        
        pyusd.mint(testUser1, 10000 * 10**6);
        pyusd.mint(testUser2, 10000 * 10**6);
        pyusd.mint(deployer, 10000 * 10**6);
        
        proofOfHuman.manuallyVerifyUser(testUser1, 12345);
        proofOfHuman.manuallyVerifyUser(testUser2, 67890);
        proofOfHuman.manuallyVerifyUser(deployer, 99999);

        console.log("=== DEPLOYMENT SUCCESSFUL ===");
        console.log("");
        console.log("CONTRACT ADDRESSES:");
        console.log("MockPYUSD:      ", address(pyusd));
        console.log("MockPyth:       ", address(pyth));
        console.log("StakingPool:    ", address(stakingPool));
        console.log("ProofOfHuman:   ", address(proofOfHuman));
        console.log("Factory:        ", address(factory));
        console.log("");
        console.log("TEST ACCOUNTS (each has 10,000 PYUSD + verified):");
        console.log("User1:          ", testUser1);
        console.log("User2:          ", testUser2);
        console.log("Deployer:       ", deployer);
        console.log("");
        console.log("Ready to build your frontend!");

        vm.stopBroadcast();
    }
}