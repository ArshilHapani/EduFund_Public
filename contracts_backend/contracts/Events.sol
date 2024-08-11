//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Events {
    event CampaignCreated(
        address indexed owner,
        string title,
        string description,
        uint256 goal,
        uint256 deadline
    );

    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 campaignId
    );
}
