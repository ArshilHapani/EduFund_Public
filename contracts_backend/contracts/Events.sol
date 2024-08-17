//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Events
 * @dev Library containing event definitions for the EduFund contract
 */
library Events {
    /**
     * @dev Emitted when a new campaign is created
     * @param owner The address of the campaign creator
     * @param campaignId The unique identifier of the campaign
     * @param title The title of the campaign
     * @param description The description of the campaign
     * @param goal The funding goal of the campaign
     * @param deadline The deadline for the campaign
     */
    event CampaignCreated(
        address indexed owner,
        uint256 indexed campaignId,
        string title,
        string description,
        uint256 goal,
        uint256 deadline
    );

    /**
     * @dev Emitted when a donation is received for a campaign
     * @param donor The address of the donor
     * @param amount The amount donated
     * @param campaignId The ID of the campaign receiving the donation
     */
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 campaignId
    );

    /**
     * @dev Emitted when a transaction is proposed for a campaign
     * @param owner The address proposing the transaction
     * @param campaignId The ID of the campaign
     * @param recipients An array of recipient addresses for the transaction
     * @param amounts An array of amounts corresponding to each recipient
     * @param descriptions An array of descriptions for each transaction
     */
    event TransactionProposed(
        address indexed owner,
        uint256 indexed campaignId,
        address payable[] recipients,
        uint256[] amounts,
        string[] descriptions
    );

    /**
     * @dev Emitted when a vote is cast on a campaign's proposed transaction
     * @param voter The address of the voter
     * @param campaignId The ID of the campaign
     * @param transactionIndex The index of the transaction being voted on
     * @param vote The vote cast (true for approval, false for rejection)
     */
    event CampaignVoted(
        address indexed voter,
        uint256 indexed campaignId,
        uint256 transactionIndex,
        bool vote
    );

    /**
     * @dev Emitted when a proposed transaction is executed
     * @param campaignId The ID of the campaign
     * @param transactionIndex The index of the executed transaction
     */
    event TransactionExecuted(
        uint256 indexed campaignId,
        uint256 transactionIndex
    );

    /**
     * @dev Emitted when a campaign is made inactive
     * @param campaignId The ID of the campaign being made inactive
     */
    event CampaignMadeInactive(uint256 indexed campaignId);

    /**
     * @dev Emitted when a transaction is being finalized
     * @param campaignId The ID of the campaign for which the transaction is being finalized
     */
    event FinalizingTransaction(uint256 indexed campaignId);
}
