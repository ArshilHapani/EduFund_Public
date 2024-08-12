//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Events {
    event CampaignCreated(
        address indexed owner,
        uint256 indexed campaignId,
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

    event TransactionProposed(
        address indexed owner,
        uint256 indexed campaignId,
        address payable[] recipients,
        uint256[] amounts,
        string[] descriptions
    );

    event CampaignVoted(
        address indexed voter,
        uint256 indexed campaignId,
        uint256 transactionIndex,
        bool vote
    );

    event TransactionExecuted(
        uint256 indexed campaignId,
        uint256 transactionIndex
    );
    event CampaignMadeInactive(uint256 indexed campaignId);
    event FinalizingTransaction(uint256 indexed campaignId);
}
