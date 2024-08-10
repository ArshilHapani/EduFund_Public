// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract Counter is AutomationCompatibleInterface {
    uint256 public counter;

    uint256 public immutable interval;
    uint256 public lastTimeStamp;

    constructor(uint256 _updateInterval) {
        interval = _updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function increment(uint256 _updateAmount) external {
        counter += _updateAmount;
    }

    function checkUpkeep(
        bytes calldata /*checkData*/
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /*performData*/)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(bytes calldata /*performData */) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            counter += 1;
        }
    }
}
