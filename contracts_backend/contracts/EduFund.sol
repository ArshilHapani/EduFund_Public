// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EduFund__Errors} from "./Errors.sol";
import {Events} from "./Events.sol";

contract EduFund {
    enum Vote {
        No,
        Yes
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
    struct CampaignVote {
        uint256 yesVotes;
        uint256 noVotes;
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
    mapping(uint256 => mapping(address => bool))
        public s_campaignIdToVoterToHasVoted;
    mapping(uint256 => CampaignVote) public s_campaignIdToVotesCount;

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
        if (campaign.balance + msg.value > campaign.goal) {
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
            } else {
                s_campaignIdToTransactions[_campaignId].push(
                    Transaction(_recipients[i], _amounts[i], _descriptions[i])
                );
            }
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
        s_campaignIdToVoterToHasVoted[_campaignId][msg.sender] = true;
        if (v == Vote.Yes) {
            s_campaignIdToVotesCount[_campaignId].yesVotes++;
        } else {
            s_campaignIdToVotesCount[_campaignId].noVotes++;
        }
        s_campaignIdToVotes[_campaignId].push(VoteStruct(msg.sender, v));

        emit Events.CampaignVoted(
            msg.sender,
            _campaignId,
            s_campaignIdToVotes[_campaignId].length - 1,
            v == Vote.Yes
        );
    }

    //////////////////// Getters Functions ////////////////////

    function finalizeTransaction(
        uint256 _campaignId
    ) public onlyOwner(_campaignId) {
        Campaign storage campaign = s_campaigns[_campaignId];
        if (!campaign.isTransactionProposed) {
            revert EduFund__Errors.TransactionIsNotYetProposed();
        }
        Transaction[] storage transactions = s_campaignIdToTransactions[
            _campaignId
        ];
        VoteStruct[] storage votes = s_campaignIdToVotes[_campaignId];
        uint256 yesVotes = s_campaignIdToVotesCount[_campaignId].yesVotes;
        uint256 noVotes = s_campaignIdToVotesCount[_campaignId].noVotes;
        if (
            (yesVotes == 0 && noVotes == 0) ||
            yesVotes + noVotes != votes.length
        ) {
            revert EduFund__Errors.InsufficientVotes();
        }
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
        campaign.isTransactionExecuted = true;
    }

    function makeCampaignInactive(
        uint256 _campaignId
    ) public onlyOwner(_campaignId) {
        s_campaigns[_campaignId].active = false;
        emit Events.CampaignMadeInactive(_campaignId);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return s_campaigns;
    }

    function getCampaignDonators(
        uint256 _campaignId
    ) public view returns (Donation[] memory) {
        return s_campaignIdToDonations[_campaignId];
    }

    function getVoters(
        uint256 _campaignId
    ) public view returns (VoteStruct[] memory) {
        return s_campaignIdToVotes[_campaignId];
    }

    function getProposalTransactions(
        uint256 _campaignId
    ) public view returns (Transaction[] memory) {
        return s_campaignIdToTransactions[_campaignId];
    }

    function getVotedCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory votedCampaigns = new Campaign[](s_campaigns.length);
        uint256 j = 0;
        for (uint256 i = 0; i < s_campaigns.length; i++) {
            if (s_campaignIdToVoterToHasVoted[s_campaigns[i].id][msg.sender]) {
                votedCampaigns[j] = s_campaigns[i];
                j++;
            }
        }
        return votedCampaigns;
    }

    function getFinalizedCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory finalizedCampaigns = new Campaign[](
            s_campaigns.length
        );
        uint256 j = 0;
        for (uint256 i = 0; i < s_campaigns.length; i++) {
            if (s_campaigns[i].isTransactionExecuted) {
                finalizedCampaigns[j] = s_campaigns[i];
                j++;
            }
        }
        return finalizedCampaigns;
    }

    function getTransactionReadyCampaigns()
        public
        view
        returns (Campaign[] memory)
    {
        Campaign[] memory readyToFinalizeCampaigns = new Campaign[](
            s_campaigns.length
        );
        uint256 j = 0;
        for (uint256 i = 0; i < s_campaigns.length; i++) {
            if (
                s_campaigns[i].owner == msg.sender &&
                s_campaigns[i].isTransactionProposed &&
                !s_campaigns[i].isTransactionExecuted
            ) {
                if (
                    s_campaignIdToVotesCount[s_campaigns[i].id].yesVotes +
                        s_campaignIdToVotesCount[s_campaigns[i].id].noVotes ==
                    s_campaignIdToDonations[s_campaigns[i].id].length
                ) {
                    readyToFinalizeCampaigns[j] = s_campaigns[i];
                    j++;
                }
            }
        }
        return readyToFinalizeCampaigns;
    }

    function getDonatorDonationsForAllCampaigns()
        public
        view
        returns (uint256[][] memory)
    {
        uint256[][] memory donatorDonations = new uint256[][](
            s_campaigns.length
        );

        for (uint256 i = 0; i < s_campaigns.length; i++) {
            donatorDonations[i] = new uint256[](2);
            uint256 amount = s_campaignIdToDonatorToDonations[
                s_campaigns[i].id
            ][msg.sender];
            donatorDonations[i][0] = s_campaigns[i].id;
            donatorDonations[i][1] = amount;
        }

        return donatorDonations;
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
        if (s_campaignIdToVoterToHasVoted[_campaignId][msg.sender]) {
            revert EduFund__Errors.CampaignAlreadyVoted();
        }
        _;
    }
}
