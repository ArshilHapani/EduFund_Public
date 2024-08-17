// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EduFund__Errors
 * @dev Library containing custom error definitions for the EduFund contract
 */
library EduFund__Errors {
    /// @dev Thrown when trying to interact with an inactive campaign
    error CampaignNotActive();

    /// @dev Thrown when trying to interact with an expired campaign
    error CampaignExpired();

    /// @dev Thrown when attempting to create a campaign with empty title or description
    error TitleAndDescriptionCannotBeEmpty();

    /// @dev Thrown when a contribution amount is zero or negative
    error ContributionMustBeGreaterThanZero();

    /// @dev Thrown when setting an invalid deadline for a campaign
    error InvalidDeadline();

    /// @dev Thrown when setting a target goal that is zero or negative
    error TargetGoalMustBeGreaterThanZero();

    /// @dev Thrown when input arrays have inconsistent lengths
    error InconsistentArrayLength();

    /// @dev Thrown when a non-owner tries to perform an owner-only action
    error InvalidCampaignOwner();

    /// @dev Thrown when there's insufficient balance to propose a transaction
    error InsufficientBalanceForProposingTransaction();

    /// @dev Thrown when a non-donator tries to vote
    error OnlyDonatorsCanVote();

    /// @dev Thrown when a transfer of funds fails
    error TransferFailed();

    /// @dev Thrown when trying to contribute to a campaign that has reached its goal
    error CampaignGoalReached();

    /// @dev Thrown when trying to interact with a transaction that hasn't been proposed
    error TransactionIsNotYetProposed();

    /// @dev Thrown when a campaign has already been voted on
    error CampaignAlreadyVoted();

    /// @dev Thrown when a recipient attempts to be a donator
    error RecipientCannotBeDonator();

    /// @dev Thrown when there are insufficient votes for an action
    error InsufficientVotes();

    /// @dev Thrown when a donator tries to donate multiple times
    error DonatorAlreadyDonated();
}
