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
    
    // ADD THESE FOR FUTUREESCROW INTEGRATION:
    mapping(address => bool) public verified;           // Track verified users by address
    mapping(address => uint256) public userIdentifiers; // Map address to user identifier

    event VerificationSucceeded(uint256 indexed userIdentifier, uint256 indexed nullifier);
    event BlacklistedPassportBlocked(bytes32 indexed hashedPassportNumber, uint256 indexed userIdentifier, uint256 indexed nullifier);
    event UserVerified(address indexed user, uint256 indexed userIdentifier);
    event UserBlacklisted(address indexed user);

    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    ) SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed) {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubV2Address)
            .setVerificationConfigV2(verificationConfig);
    }

    //  REQUIRED FUNCTION FOR FUTUREESCROW INTEGRATION
    /// @notice Check if a user is verified (required by FutureEscrow)
    function isVerified(address user) external view returns (bool) {
        return verified[user];
    }

    //  ADMIN FUNCTIONS FOR TESTING/MANAGEMENT
    /// @notice Manually verify a user (for testing or admin purposes)
    function manuallyVerifyUser(address user, uint256 userIdentifier) external {
        verified[user] = true;
        userIdentifiers[user] = userIdentifier;
        emit UserVerified(user, userIdentifier);
    }

    /// @notice Blacklist a verified user by address
    function blacklistUser(address user) external {
        verified[user] = false;
        emit UserBlacklisted(user);
    }

    // EXISTING FUNCTIONS
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

        //  AUTO-VERIFY USER AFTER SUCCESSFUL SELF PROTOCOL VERIFICATION
        address userAddress = tx.origin; // Get the transaction originator
        verified[userAddress] = true;
        userIdentifiers[userAddress] = output.userIdentifier;

        emit VerificationSucceeded(output.userIdentifier, output.nullifier);
        emit UserVerified(userAddress, output.userIdentifier);
    }

    // VIEW FUNCTIONS
    function getUserIdentifier(address user) external view returns (uint256) {
        return userIdentifiers[user];
    }

    function isUserBlacklisted(address user) external view returns (bool) {
        return !verified[user] && userIdentifiers[user] != 0; // Had verification before but now blacklisted
    }
}