// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityVerifier is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    mapping(address => bool) public verifiedUsers;

    constructor() ERC721("VerifiedIdentity", "VID") Ownable(_msgSender()) {}

    function issueIdentity(address user, string memory metadataURI) public onlyOwner returns (uint256) {
        require(!verifiedUsers[user], "User already verified");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(user, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        verifiedUsers[user] = true;
        return newTokenId;
    }

    function verifyIdentity(address user) external view returns (bool) {
        return verifiedUsers[user];
    }
}