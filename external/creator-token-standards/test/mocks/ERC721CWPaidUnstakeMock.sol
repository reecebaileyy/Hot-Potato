// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "src/access/OwnableBasic.sol";
import "src/erc721c/presets/ERC721CWPaidUnstake.sol";

contract ERC721CWPaidUnstakeMock is OwnableBasic, ERC721CWPaidUnstake {
    constructor(uint256 unrevealPrice_, address wrappedCollectionAddress_)
        ERC721CWPaidUnstake(unrevealPrice_, wrappedCollectionAddress_, "ERC-721C Mock", "MOCK")
    {}

    function mint(address, /*to*/ uint256 tokenId) external {
        stake(tokenId);
    }
}
