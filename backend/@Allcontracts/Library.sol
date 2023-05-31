//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Base64.sol";


library HotGenerate {
    using Strings for uint256;

    struct TokenTraits {
        bool hasPotato;
        uint256 generation;
        uint8 background;
        uint8 color1;
        uint8 color2;
        uint8 color3;
    }

    function generateRandomTraits(
        uint256 nonce,
        uint256 generation,
        string[] memory COLORS,
        uint256[] memory COLOR_WEIGHTS
    ) internal view returns (TokenTraits memory trait) {
        trait.hasPotato = false;
        trait.generation = generation;
        trait.background = getRandomColor(COLORS, nonce++, COLOR_WEIGHTS);
        trait.color1 = getRandomColor(COLORS, nonce++, COLOR_WEIGHTS);
        trait.color2 = getRandomColor(COLORS, nonce++, COLOR_WEIGHTS);
        trait.color3 = getRandomColor(COLORS, nonce++, COLOR_WEIGHTS);

        return trait;
    }

    function getRandomColor(
        string[] memory COLORS,
        uint256 nonce,
        uint256[] memory WEIGHTS
    ) internal view returns (uint8) {
        require(
            COLORS.length == WEIGHTS.length,
            "COLORS and WEIGHTS length must be the same"
        );

        uint256 totalWeight = 0;
        for (uint256 i = 0; i < WEIGHTS.length; i++) {
            totalWeight += WEIGHTS[i];
        }

        uint256 randomNum = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.number, nonce))
        ) % totalWeight;

        for (uint8 i = 0; i < COLORS.length; i++) {
            if (randomNum < WEIGHTS[i]) {
                return i;
            }
            randomNum -= WEIGHTS[i];
        }

        revert("Should never reach here if weights are set correctly.");
    }

    function createSVG(TokenTraits memory trait, string[] memory COLORS)
        internal
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><rect width="100%" height="100%" fill="',
                    COLORS[trait.background],
                    '" /><circle cx="50%" cy="50%" r="30%" fill="',
                    COLORS[trait.color1],
                    '" /><circle cx="50%" cy="50%" r="20%" fill="',
                    COLORS[trait.color2],
                    '" /><circle cx="50%" cy="50%" r="10%" fill="',
                    COLORS[trait.color3],
                    '" /><text x="50%" y="50%" font-family="serif" font-size="14px" text-anchor="middle" fill="#000">'
                )
            );
    }

    function createAttributes(
        TokenTraits memory trait,
        string[] memory COLOR_NAMES
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '"attributes": [{"trait_type": "Has Potato", "value": "',
                    trait.hasPotato ? "Yes" : "No",
                    '"},{"trait_type": "Generation", "value": "',
                    (trait.generation).toString(),
                    '"},{"trait_type": "Background", "value": "',
                    COLOR_NAMES[trait.background],
                    '"},{"trait_type": "Color 1", "value": "',
                    COLOR_NAMES[trait.color1],
                    '"},{"trait_type": "Color 2", "value": "',
                    COLOR_NAMES[trait.color2],
                    '"},{"trait_type": "Color 3", "value": "',
                    COLOR_NAMES[trait.color3],
                    '"}]'
                )
            );
    }

    function getImageString(
        HotGenerate.TokenTraits memory trait,
        string[] memory COLORS
    )
        internal
        pure
        returns (string memory)
    {
        string memory baseSvg = createSVG(trait, COLORS);
        string memory endSvg = "</text></svg>";

        if (trait.hasPotato) {
            return string(abi.encodePacked(baseSvg, "P", endSvg));
        } else {
            return string(abi.encodePacked(baseSvg, "NOT P", endSvg));
        }
    }
}
