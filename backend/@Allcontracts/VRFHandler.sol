// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract VRFHandler is VRFConsumerBaseV2Plus {
    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint16 public requestConfirmations = 3;
    uint32 public callbackGasLimit = 2_500_000;
    uint32 public numWords = 1;

    address public gameContract;

    constructor(
        uint256 _subId,
        bytes32 _keyHash,
        address _game
    )
        VRFConsumerBaseV2Plus(0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE) // Base Sepolia VRF Coordinator
    {
        subscriptionId = _subId;
        keyHash = _keyHash;
        gameContract = _game;
    }

    function requestRandomness(bool nativePayment)
        external
        returns (uint256 requestId)
    {
        require(msg.sender == gameContract, "Only game can call");
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: nativePayment})
                )
            })
        );
    }

    // Relay randomness back to your main contract
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        (bool ok, ) = gameContract.call(
            abi.encodeWithSignature(
                "onRandomWords(uint256,uint256[])", requestId, randomWords
            )
        );
        require(ok, "Callback failed");
    }
}
