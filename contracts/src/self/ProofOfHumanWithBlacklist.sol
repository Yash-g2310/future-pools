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
    
    // Bridge address that can listen to events
    address public bridgeOperator;

    // Enhanced event to include user address and passport hash
    event VerificationSucceeded(
        uint256 indexed userIdentifier, 
        uint256 indexed nullifier,
        address user,
        bytes32 hashedPassport
    );
    
    event BlacklistedPassportBlocked(
        bytes32 indexed hashedPassportNumber, 
        uint256 indexed userIdentifier, 
        uint256 indexed nullifier
    );
    
    event PassportBlacklisted(bytes32 indexed hashedPassport);
    event PassportUnblacklisted(bytes32 indexed hashedPassport);

    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig,
        address _bridgeOperator
    ) SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed) {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubV2Address)
            .setVerificationConfigV2(verificationConfig);
        bridgeOperator = _bridgeOperator;
    }

    function addBlacklistedPassport(bytes32 hashedPassport) external {
        blacklistedPassports[hashedPassport] = true;
        emit PassportBlacklisted(hashedPassport);
    }

    function removeBlacklistedPassport(bytes32 hashedPassport) external {
        blacklistedPassports[hashedPassport] = false;
        emit PassportUnblacklisted(hashedPassport);
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
            
            // Emit enhanced event with user address and passport hash
            emit VerificationSucceeded(output.userIdentifier, output.nullifier, msg.sender, hashedPassport);
        } else {
            // No passport info, just emit basic event
            emit VerificationSucceeded(output.userIdentifier, output.nullifier, msg.sender, bytes32(0));
        }
    }
}