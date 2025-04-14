// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityVerifier {
    enum VerificationStatus { NotRequested, Pending, Verified }
    mapping(address => bytes32) public userMetadataHash;
    mapping(address => bool) public isVerified;

    struct User {
        string name;
        uint age;
        string email;
        VerificationStatus status;
    }

    mapping(address => User) public users;

    address public admin;

    event VerificationRequested(address indexed user);
    event Verified(address indexed user);
    event ReVerificationRequested(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function requestVerification(string memory _name, uint _age, string memory _email) external {
        User storage user = users[msg.sender];

        // Allow all users to request verification, even if previously verified
        if (user.status == VerificationStatus.Verified) {
            emit ReVerificationRequested(msg.sender);
        }

        user.name = _name;
        user.age = _age;
        user.email = _email;
        user.status = VerificationStatus.Pending;

        emit VerificationRequested(msg.sender);
    }

    function verifyUser(address _user) external onlyAdmin {
        require(users[_user].status == VerificationStatus.Pending, "User must have pending request");
        users[_user].status = VerificationStatus.Verified;

        emit Verified(_user);
    }

    function getVerificationStatus(address _user) external view returns (VerificationStatus) {
        return users[_user].status;
    }

    function getUserInfo(address _user) external view returns (string memory, uint, string memory, VerificationStatus) {
        User memory user = users[_user];
        return (user.name, user.age, user.email, user.status);
    }

    function submitMetadataHash(bytes32 metadataHash) public {
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