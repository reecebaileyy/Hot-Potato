// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Renders hand metadata and art. Implemented by InventoryManager.
interface IMetadataHandler {
    function getTokenURI(
        uint256 id_,
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint32 generation_,
        bool isActive_,
        uint8 potato_
    ) external view returns (string memory);

    function getSVGInterface(
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint8 potato_
    ) external view returns (string memory);
}
