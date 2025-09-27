// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ProofOfHumanWithBlacklist } from "../src/self/ProofOfHumanWithBlacklist.sol";
import { BaseScript } from "./Base.s.sol";
import { CountryCodes } from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

contract DeployProofOfHumanWithBlacklist is BaseScript {
    error DeploymentFailed();

    function run() public broadcast returns (ProofOfHumanWithBlacklist deployed) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string[] memory forbiddenCountries = new string[](1);

        // Optional: Set a forbidden country, else leave blank
        forbiddenCountries[0] = CountryCodes.UNITED_STATES; // no forbidden countries

        SelfUtils.UnformattedVerificationConfigV2 memory config = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries,
            ofacEnabled: false
        });

        deployed = new ProofOfHumanWithBlacklist(
            hubAddress,
            "human-blacklist-scope",
            config,
            0x2107c16C62649AF27C864b8Ca3D04faC1a281361 // example bridge operator address
        );

        console.log("ProofOfHumanWithBlacklist deployed to:", address(deployed));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Value:", deployed.scope());

        if (address(deployed) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
    }
}
