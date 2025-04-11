// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityVerifier {
    mapping(address => bytes32) public userMetadataHash;
    mapping(address => bool) public isVerified;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // ✅ Users can submit metadata hash directly
    function submitMetadataHash(bytes32 metadataHash) public {
        require(userMetadataHash[msg.sender] == 0, "Already submitted");
        userMetadataHash[msg.sender] = metadataHash;
    }

    function issueIdentity(address user, bytes32 metadataHash) public {
        require(msg.sender == admin, "Only admin");
        require(!isVerified[user], "Already verified");

        userMetadataHash[user] = metadataHash;
        isVerified[user] = true;
    }

    function getMetadataHash(address user) public view returns (bytes32) {
        return userMetadataHash[user];
    }

    function verifyIdentity(address user) public view returns (bool) {
        return isVerified[user];
    }
} 