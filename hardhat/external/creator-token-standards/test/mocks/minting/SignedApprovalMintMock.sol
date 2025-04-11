// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "src/access/OwnableBasic.sol";
import "src/access/OwnableInitializable.sol";
import "src/erc721c/ERC721C.sol";
import "src/minting/SignedApprovalMint.sol";

contract SignedApprovalMintMock is ERC721C, SignedApprovalMint, OwnableBasic {
    constructor(address signer_, uint256 maxSignedMints_, uint256 maxSupply_, uint256 maxOwnerMints_)
        ERC721OpenZeppelin("SignedApprovalMintMock", "SAM")
        SignedApprovalMint(signer_, maxSignedMints_)
        MaxSupply(maxSupply_, maxOwnerMints_)
        EIP712("SignedApprovalMintMock", "1")
    {}

    function _mintToken(address to, uint256 tokenId) internal virtual override {
        _mint(to, tokenId);
    }
}

contract SignedApprovalMintInitializableMock is
    ERC721CInitializable,
    SignedApprovalMintInitializable,
    OwnableInitializable
{
    constructor() ERC721("", "") EIP712("SignedApprovalMintInitializableMock", "1") {}

    function _mintToken(address to, uint256 tokenId) internal virtual override {
        _mint(to, tokenId);
    }
}
