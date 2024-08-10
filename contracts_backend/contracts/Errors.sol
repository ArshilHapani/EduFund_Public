// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library EduFund__Errors {
    error CampaignNotActive();
    error CampaignExpired();
    error ContributionMustBeGreaterThanZero();
    error InvalidDeadline();
    error TargetGoalMustBeGreaterThanZero();
}
