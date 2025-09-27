// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

contract ProofOfHumanWithBlacklist is SelfVerificationRoot {
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;

    mapping(bytes32 => bool) public blacklistedPassports;

    event VerificationSucceeded(uint256 indexed userIdentifier, uint256 indexed nullifier);
    event BlacklistedPassportBlocked(bytes32 indexed hashedPassportNumber, uint256 indexed userIdentifier, uint256 indexed nullifier);

    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    ) SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed) {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubV2Address)
            .setVerificationConfigV2(verificationConfig);
    }

    function addBlacklistedPassport(bytes32 hashedPassport) external /* onlyOwner */ {
        blacklistedPassports[hashedPassport] = true;
    }

    function removeBlacklistedPassport(bytes32 hashedPassport) external /* onlyOwner */ {
        blacklistedPassports[hashedPassport] = false;
    }

    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {
        string memory passportNumber = output.idNumber;

        if (bytes(passportNumber).length > 0) {
            bytes32 hashedPassport = keccak256(abi.encodePacked(passportNumber));
            if (blacklistedPassports[hashedPassport]) {
                emit BlacklistedPassportBlocked(hashedPassport, output.userIdentifier, output.nullifier);
                revert("Passport number is blacklisted");
            }
        }

        emit VerificationSucceeded(output.userIdentifier, output.nullifier);
    }
}
