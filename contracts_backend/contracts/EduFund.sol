// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EduFund__Errors} from "./Errors.sol";
import {Events} from "./Events.sol";

contract EduFund {
    struct Campaign {
        address payable owner;
        string title;
        string description;
        uint256 goal;
        uint256 balance;
        uint256 deadline;
        bool active;
        bool isExecuted;
    }

    struct Donation {
        address donor;
        uint256 amount;
    }
    // TODO Proposal of required transaction for education addresses with reasons (where to spend money and why with recipient address) (Step 3 of the task)

    Campaign[] public s_campaigns;
    mapping(uint256 => Campaign) s_idToCampaignMapping;

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadline
    ) public {
        if (_deadline < block.timestamp) {
            revert EduFund__Errors.InvalidDeadline();
        }
        if (_goal == 0) {
            revert EduFund__Errors.TargetGoalMustBeGreaterThanZero();
        }
        uint256 len = s_campaigns.length;
        s_campaigns.push(
            Campaign(
                payable(msg.sender),
                _title,
                _description,
                _goal,
                0,
                _deadline,
                true,
                false
            )
        );
        s_idToCampaignMapping[len - 1] = s_campaigns[len - 1];

        emit Events.CampaignCreated(
            msg.sender,
            _title,
            _description,
            _goal,
            _deadline
        );
    }

    function donate(uint256 _campaignId) public payable {
        if (msg.value == 0) {
            revert EduFund__Errors.ContributionMustBeGreaterThanZero();
        }
        Campaign storage campaign = s_campaigns[_campaignId];
        if (!campaign.active) {
            revert EduFund__Errors.CampaignNotActive();
        }
        if (block.timestamp > campaign.deadline) {
            revert EduFund__Errors.CampaignExpired();
        }

        campaign.balance += msg.value;

        emit Events.DonationReceived(msg.sender, msg.value, _campaignId);
    }

    ///////////////// Modifiers /////////////////

    modifier checkCampaignExpiration(uint256 _campaignId) {
        Campaign storage campaign = s_campaigns[_campaignId];
        if (!campaign.active) {
            revert EduFund__Errors.CampaignNotActive();
        }
        if (block.timestamp > campaign.deadline) {
            campaign.active = false;
            revert EduFund__Errors.CampaignExpired();
        }
        _;
    }
}
