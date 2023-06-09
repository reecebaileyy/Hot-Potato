// SPDX-License-Identifier: Unlicense
import "./Inventory.sol";
pragma solidity 0.8.7;

contract InventoryManager {
    address impl_;
    address public manager;

    enum Part {
        background,
        hand_type,
        potato
    }

    mapping(uint8 => address) public backgrounds;
    mapping(uint8 => address) public hand_types;
    mapping(uint8 => address) public potatoes;

    string public constant header = //CHANGE THIS LATER
        '<svg id="backburner" width="100%" height="100%" version="1.1" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    string public constant footer = //CHANGE THIS LATER
        "<style>#backburner{shape-rendering: crispedges; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor;}</style></svg>";
    
    function getSVG(
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint8 potato_
    ) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    header,
                    get(Part.background, background_),
                    get(Part.hand_type, hand_type_),
                    hasPotato_ ? get(Part.potato, potato_) : "",
                    footer
                )
            );
    }


    constructor() {
        manager = msg.sender;
    }

    function getTokenURI(
        uint16 id_,
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint32 generation_,
        bool isActive_,
        uint8 potato_
    ) external view returns (string memory) {
        
        string memory svg = Base64.encode(bytes(getSVG(background_,hand_type_,hasPotato_,potato_)));
        
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "Token #',
                                toString(id_),
                                '", "description": "A simple Token", "image": "data:image/svg+xml;base64,',
                                svg,
                                '", ',
                                getAttributes(
                                    background_,
                                    hand_type_,
                                    hasPotato_,
                                    generation_,
                                    isActive_
                                ),
                                "}"
                            )
                        )
                    )
                )
            );
    }

    /*///////////////////////////////////////////////////////////////
                    INVENTORY MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function setBackgrounds(uint8 count, address source) external {
        require(msg.sender == manager, "not manager");

        for (uint8 id = 1; id <= count; id++) {
            backgrounds[id] = source;
        }
    }

    function setHands(uint8 count, address source) external {
        require(msg.sender == manager, "not manager");

        for (uint8 id = 1; id <= count; id++) {
            hand_types[id] = source;
        }
    }

    function setPotatoes(uint8 count, address source) external {
        require(msg.sender == manager, "not manager");

        for (uint8 id = 1; id <= count; id++) {
            potatoes[id] = source;
        }
    }

    /*///////////////////////////////////////////////////////////////
                    INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function call(
        address source,
        bytes memory sig
    ) internal view returns (string memory svg) {
        (bool succ, bytes memory ret) = source.staticcall(sig);
        require(succ, "failed to get data");
        svg = abi.decode(ret, (string));
    }

    function get(Part part, uint8 id) public view returns (string memory svg) {
    address source;
    if (part == Part.background) {
        source = backgrounds[id];
    } else if (part == Part.hand_type) {
        source = hand_types[id];
    } else if (part == Part.potato){
        source = potatoes[id];
    } else {
        revert("invalid part");
    }
    string memory sig;
    if (part == Part.background) {
        if (1 <= id && id <= 11) {
            sig = "getBlue()";
        } else if(11 < id && id <= 17) {
            sig = "getGreen()";
        } else if (17 < id && id <= 20) {
            sig = "getPurple()";
        } else {
            revert("Invalid Background Id");
        }
    } else if (part == Part.hand_type) {
        if (1 <= id && id <= 3) {
            sig = "getHand1()";
        } else if(3 < id && id <= 5) {
            sig = "getHand2()";
        } else if(5 < id && id <= 8) {
            sig = "getHand3()";
        } else if (8 < id && id <= 11) {
            sig = "getHand4()";
        } else if (11 < id && id <= 14) {
            sig = "getBubbleGum()";
        } else if (14 < id && id <= 17) {
            sig = "getGreenSlime()";
        } else if (17 < id && id <= 20) {
            sig = "getVitiligo()";
        }
         else {
            revert("Invalid Background Id");
        }
    } else if (part == Part.potato) {
        sig = "getPotato()";
    } else {
        revert("invalid part");
    }
(bool succ, bytes memory data) = source.staticcall(
            abi.encodeWithSignature(sig)
        );    require(succ, "failed to get data");
    return wrapTag(abi.decode(data, (string)));
}

function wrapTag(string memory uri) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<image x="1" y="1" width="60" height="60" image-rendering="pixelated" preserveAspectRatio="xMidYMid" xlink:href="data:image/png;base64,',
                    uri,
                    '"/>'
                )
            );
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function getAttributes(
    uint8 background_,
    uint8 hand_type_,
    bool hasPotato_,
    uint32 generation_,
    bool isActive_
) public pure returns (string memory) {
    return
        string(
            abi.encodePacked(
                '"attributes": [',
                getBackgroundAttributes(background_),
                ",",
                getHandAttributes(hand_type_),
                ',{"trait_type": "Potato", "value":"',
                hasPotato_ ? "Yes" : "No",
                '"},{"display_type": "number","trait_type": "Generation", "value":"', 
                toString(generation_),
                '"},{"trait_type": "Active", "value":"', 
                isActive_ ? "Yes" : "No",
                '"}]'
            )           
        );
}


    function getBackgroundAttributes(
        uint8 background_
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"Background", "value":"',
                    getBackgroundName(background_),
                    '"}'
                )
            );
    }

    function getHandAttributes(
        uint8 hand_type_
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"Hand Type", "value": "',
                    getHandName(hand_type_),'"}'
                )
            );
    }


    // Here, we do sort of a Binary Search to find the correct name. Not the pritiest code I've wrote, but hey, it works!

    function getBackgroundName(uint8 id) public pure returns (string memory) {
        if (id <= 20) {
            if (id < 10) {
                if (id < 5) {
                    if (id < 3) {
                        return id == 1 ? "Blue" : "Blue";
                    }
                    return id == 3 ? "Blue" : "Blue";
                }
                if (id < 7)
                    return id == 5 ? "Blue" : "Blue";
                return
                    id == 7 ? "Blue" : id == 8 ? "Blue" : "Blue";
            }
            if (id <= 15) {
                if (id < 13) {
                    return
                        id == 10 ? "Blue" : id == 11
                            ? "Blue"
                            : "Green";
                }
                return
                    id == 13 ? "Green" : id == 14
                        ? "Green"
                        : "Green";
            }
            if (id < 18) {
                return id == 16 ? "Green" : "Green";
            }
            return id == 18 ? "Purple" : id == 19 ? "Purple" : "Purple";
        }
    }

    function getHandName(uint8 id) public pure returns (string memory) {
        if (id <= 20) {
            if (id < 10) {
                if (id < 5) {
                    if (id < 3) {
                        return id == 1 ? "White" : "White";
                    }
                    return id == 3 ? "White" : "Tan";
                }
                if (id < 7)
                    return id == 5 ? "Tan" : "Brown";
                return
                    id == 7 ? "Brown" : id == 8 ? "Brown" : "Black";
            }
            if (id <= 15) {
                if (id < 13) {
                    return
                        id == 10 ? "Black" : id == 11
                            ? "Black"
                            : "Bubble Gum";
                }
                return
                    id == 13 ? "Bubble Gum" : id == 14
                        ? "Bubble Gum"
                        : "Green Slime";
            }
            if (id < 18) {
                return id == 16 ? "Green Slime" : "Green Slime";
            }
            return id == 18 ? "Vitiligo" : id == 19 ? "Vitiligo" : "Vitiligo";
        }
    }

}

/// @title Base64
/// @author Brecht Devos - <brecht@loopring.org>
/// @notice Provides a function for encoding some bytes in base64
/// @notice NOT BUILT BY ETHERORCS TEAM. Thanks Bretch Devos!
library Base64 {
    string internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // load the table into memory
        string memory table = TABLE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
            // set the actual output length
            mstore(result, encodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 3 bytes at a time
            for {

            } lt(dataPtr, endPtr) {

            } {
                dataPtr := add(dataPtr, 3)

                // read 3 bytes
                let input := mload(dataPtr)

                // write 4 characters
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(input, 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
            }

            // padding with '='
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }

        return result;
    }
}