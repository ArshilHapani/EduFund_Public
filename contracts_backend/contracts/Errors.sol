// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library EduFund__Errors {
    error CampaignNotActive();
    error CampaignExpired();
    error TitleAndDescriptionCannotBeEmpty();
    error ContributionMustBeGreaterThanZero();
    error InvalidDeadline();
    error TargetGoalMustBeGreaterThanZero();
    error InconsistentArrayLength();
    error InvalidCampaignOwner();
    error InsufficientBalanceForProposingTransaction();
    error OnlyDonatorsCanVote();
    error TransferFailed();
    error CampaignGoalReached();
    error TransactionIsNotYetProposed();
    error CampaignAlreadyVoted();
    error RecipientCannotBeDonator();
}
