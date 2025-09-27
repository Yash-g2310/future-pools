pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";

abstract contract BaseScript is Script {
    address internal broadcaster;

    modifier broadcast() {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        broadcaster = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);
        _;
        vm.stopBroadcast();
    }
}
