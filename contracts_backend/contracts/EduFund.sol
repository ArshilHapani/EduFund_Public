// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {console} from "hardhat/console.sol";

import {EduFund__Errors} from "./Errors.sol";
import {Events} from "./Events.sol";

contract EduFund {
    enum Vote {
        Yes,
        No
    }

    struct Campaign {
        address payable owner;
        string title;
        string description;
        uint256 goal;
        uint256 balance;
        uint256 deadline;
        bool active;
        bool isTransactionProposed;
        bool isTransactionExecuted;
        uint256 id;
    }

    struct Donation {
        address donor;
        uint256 amount;
    }
    struct VoteStruct {
        address voter;
        Vote vote;
    }

    struct Transaction {
        address payable recipient;
        uint256 amount;
        string description;
    }

    Campaign[] public s_campaigns;

    mapping(uint256 => Donation[]) public s_campaignIdToDonations;
    mapping(uint256 => Transaction[]) public s_campaignIdToTransactions;
    mapping(uint256 => VoteStruct[]) public s_campaignIdToVotes;

    // for fast lookup
    // campaignId -> donator -> amount
    mapping(uint256 => mapping(address => uint256))
        public s_campaignIdToDonatorToDonations;

    // NOTE 20% of the goal is for approximation as we are dealing with floating point numbers and this can be changed as per the requirement
    uint16 constant DEDUCED_THRESHOLD_PERCENT = 20;

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
        if (bytes(_title).length == 0 || bytes(_description).length == 0) {
            revert EduFund__Errors.TitleAndDescriptionCannotBeEmpty();
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
                false,
                false,
                len
            )
        );

        emit Events.CampaignCreated(
            msg.sender,
            len,
            _title,
            _description,
            _goal,
            _deadline
        );
    }

    function donate(
        uint256 _campaignId
    ) public payable checkCampaignExpiration(_campaignId, true) {
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
        if (campaign.balance + msg.value >= campaign.goal) {
            revert EduFund__Errors.CampaignGoalReached();
        }
        campaign.balance += msg.value;
        s_campaignIdToDonations[_campaignId].push(
            Donation(msg.sender, msg.value)
        );
        s_campaignIdToDonatorToDonations[_campaignId][msg.sender] += msg.value;

        emit Events.DonationReceived(msg.sender, msg.value, _campaignId);
    }

    function proposeTransactions(
        uint256 _campaignId,
        address payable[] memory _recipients,
        uint256[] memory _amounts,
        string[] memory _descriptions
    ) public checkCampaignExpiration(_campaignId, true) onlyOwner(_campaignId) {
        uint256 len = _recipients.length;
        if (len == 0 || len != _amounts.length || len != _descriptions.length) {
            revert EduFund__Errors.InconsistentArrayLength();
        }
        Campaign storage campaign = s_campaigns[_campaignId];
        if (
            campaign.balance <
            campaign.goal - calculatePercentageAmount(campaign.goal)
        ) {
            revert EduFund__Errors.InsufficientBalanceForProposingTransaction();
        }
        for (uint256 i = 0; i < _recipients.length; i++) {
            if (
                s_campaignIdToDonatorToDonations[_campaignId][_recipients[i]] >
                0
            ) {
                revert EduFund__Errors.RecipientCannotBeDonator();
            }
        }
        for (uint256 i = 0; i < _recipients.length; i++) {
            s_campaignIdToTransactions[_campaignId].push(
                Transaction(_recipients[i], _amounts[i], _descriptions[i])
            );
        }
        campaign.isTransactionProposed = true;
        campaign.active = false;

        emit Events.TransactionProposed(
            msg.sender,
            _campaignId,
            _recipients,
            _amounts,
            _descriptions
        );
    }

    function vote(
        uint256 _campaignId,
        Vote v
    )
        public
        onlyDonator(_campaignId)
        checkCampaignExpiration(_campaignId, false)
    {
        // transaction must be proposed
        if (!s_campaigns[_campaignId].isTransactionProposed) {
            revert EduFund__Errors.TransactionIsNotYetProposed();
        }

        s_campaignIdToVotes[_campaignId].push(VoteStruct(msg.sender, v));

        emit Events.CampaignVoted(
            msg.sender,
            _campaignId,
            s_campaignIdToVotes[_campaignId].length - 1,
            v == Vote.Yes
        );
        if (
            s_campaignIdToVotes[_campaignId].length ==
            s_campaignIdToDonations[_campaignId].length
        ) {
            emit Events.FinalizingTransaction(_campaignId);
            finalizeTransaction(_campaignId);
        }
    }

    function finalizeTransaction(uint256 _campaignId) internal {
        Campaign storage campaign = s_campaigns[_campaignId];
        Transaction[] storage transactions = s_campaignIdToTransactions[
            _campaignId
        ];
        VoteStruct[] storage votes = s_campaignIdToVotes[_campaignId];
        uint256 yesVotes = 0;
        uint256 noVotes = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].vote == Vote.Yes) {
                yesVotes++;
            } else {
                noVotes++;
            }
        }
        console.log("yesVotes: %d", yesVotes);
        console.log("noVotes: %d", noVotes);
        if (yesVotes > noVotes) {
            for (uint256 i = 0; i < transactions.length; i++) {
                (bool success, ) = transactions[i].recipient.call{
                    value: transactions[i].amount
                }("");
                if (!success) {
                    revert EduFund__Errors.TransferFailed();
                }
            }
            campaign.isTransactionExecuted = true;
            emit Events.TransactionExecuted(
                _campaignId,
                transactions.length - 1
            );
        } else {
            // refund the money to the donators
            for (
                uint256 i = 0;
                i < s_campaignIdToDonations[_campaignId].length;
                i++
            ) {
                (bool success, ) = s_campaignIdToDonations[_campaignId][i]
                    .donor
                    .call{
                    value: s_campaignIdToDonations[_campaignId][i].amount
                }("");
                if (!success) {
                    revert EduFund__Errors.TransferFailed();
                }
            }
        }
    }

    function makeCampaignInactive(
        uint256 _campaignId
    ) public onlyOwner(_campaignId) {
        s_campaigns[_campaignId].active = false;
        emit Events.CampaignMadeInactive(_campaignId);
    }

    function calculatePercentageAmount(
        uint256 amount
    ) internal pure returns (uint256) {
        uint256 ans;
        assembly {
            amount := mul(amount, DEDUCED_THRESHOLD_PERCENT)
            ans := div(amount, 100)
        }
        return ans;
    }
    ///////////////// Modifiers /////////////////

    modifier checkCampaignExpiration(
        uint256 _campaignId,
        bool isActiveRequired
    ) {
        Campaign storage campaign = s_campaigns[_campaignId];
        if (isActiveRequired && !campaign.active) {
            revert EduFund__Errors.CampaignNotActive();
        }
        if (block.timestamp > campaign.deadline) {
            campaign.active = false;
            revert EduFund__Errors.CampaignExpired();
        }
        _;
    }

    modifier onlyOwner(uint256 _campaignId) {
        if (s_campaigns[_campaignId].owner != msg.sender) {
            revert EduFund__Errors.InvalidCampaignOwner();
        }
        _;
    }

    modifier onlyDonator(uint256 _campaignId) {
        if (s_campaignIdToDonatorToDonations[_campaignId][msg.sender] == 0) {
            revert EduFund__Errors.OnlyDonatorsCanVote();
        }
        // check if the donator has already voted
        VoteStruct[] memory votes = s_campaignIdToVotes[_campaignId];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].voter == msg.sender) {
                revert EduFund__Errors.CampaignAlreadyVoted();
            }
        }
        _;
    }
}
