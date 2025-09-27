// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PassportVerifier is AccessControl {
    // Explicitly use the ECDSA library for bytes32 type
    using ECDSA for bytes32;
    
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant ESCROW_FACTORY_ROLE = keccak256("ESCROW_FACTORY_ROLE");
    
    // Verification mappings
    mapping(address => bool) public verified;
    mapping(address => bytes32) public userPassportHash;
    mapping(bytes32 => bool) public blacklistedPassports;
    
    // Nonce tracking to prevent replay attacks
    mapping(bytes32 => bool) public usedSignatures;
    
    // Events
    event UserVerified(address indexed user, bytes32 indexed passportHash);
    event PassportBlacklisted(bytes32 indexed passportHash);
    event BlacklistRemoved(bytes32 indexed passportHash);
    
    constructor(address bridgeOperator, address escrowFactory) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, bridgeOperator);
        if (escrowFactory != address(0)) {
            _grantRole(ESCROW_FACTORY_ROLE, escrowFactory);
        }
    }
    
    /// @notice Register verification from Celo chain using bridge signature
    function verifyWithSignature(
        bytes32 passportHash,
        uint256 timestamp,
        bytes memory signature
    ) external {
        // Verify this is a recent request
        require(block.timestamp <= timestamp + 1 hours, "Signature expired");
        require(passportHash != bytes32(0), "Invalid passport hash");
        
        // Create unique message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            "VERIFY",
            msg.sender,
            passportHash,
            timestamp
        ));
        
        // Prevent signature reuse
        require(!usedSignatures[messageHash], "Signature already used");
        usedSignatures[messageHash] = true;
        
        // Manual implementation of signature verification to avoid compatibility issues
        // This is equivalent to messageHash.toEthSignedMessageHash() and then recover()
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // Recover the signer from the signature
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        
        require(hasRole(BRIDGE_ROLE, recoveredSigner), "Invalid signature");
        
        // Check if passport is blacklisted
        require(!blacklistedPassports[passportHash], "Passport is blacklisted");
        
        verified[msg.sender] = true;
        userPassportHash[msg.sender] = passportHash;
        
        emit UserVerified(msg.sender, passportHash);
    }
    
    // Manual implementation of signature recovery
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        require(_signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature 'v' value");
        
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }
    
    /// @notice Blacklist a passport (called by bridge or admin)
    function blacklistPassport(bytes32 passportHash) external onlyRole(BRIDGE_ROLE) {
        require(passportHash != bytes32(0), "Invalid passport hash");
        blacklistedPassports[passportHash] = true;
        emit PassportBlacklisted(passportHash);
    }
    
    /// @notice Remove passport from blacklist (called by bridge or admin)
    function removePassportFromBlacklist(bytes32 passportHash) external onlyRole(BRIDGE_ROLE) {
        require(passportHash != bytes32(0), "Invalid passport hash");
        blacklistedPassports[passportHash] = false;
        emit BlacklistRemoved(passportHash);
    }
    
    /// @notice Check if a user is verified (required by FutureEscrow)
    function isVerified(address user) external view returns (bool) {
        bytes32 passportHash = userPassportHash[user];
        return verified[user] && !blacklistedPassports[passportHash];
    }
    
    /// @notice Called by escrow factory to report a default
    function reportDefault(address user) external onlyRole(ESCROW_FACTORY_ROLE) {
        require(verified[user], "User not verified");
        bytes32 passportHash = userPassportHash[user];
        require(passportHash != bytes32(0), "No passport associated");
        
        blacklistedPassports[passportHash] = true;
        emit PassportBlacklisted(passportHash);
    }
}