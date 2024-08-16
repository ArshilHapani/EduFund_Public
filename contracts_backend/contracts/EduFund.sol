// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EduFund__Errors} from "./Errors.sol";
import {Events} from "./Events.sol";

/// @title This contract is used to create a crowdfunding platform for educational purposes
/// @author @arshil (https://github.com/ArshilHapani)
/// @author @vishvam (https://github.com/thevishvammoliya)
/// @notice It is divided into multiple phase process for collecting funds and executing the transaction
/* - Phase 1: Create a campaign (by the owner)
 - Phase 2: Donate to the campaign (by donators)
 - Phase 3: Propose a transaction (by the owner)
 - Phase 4: Vote on the proposed transaction (by donators)
 - Phase 5: Finalize the transaction (by the owner) */
/// @dev `Errors.sol` and `Events.sol` are imported to emit events and revert with error messages
contract EduFund {
    ///////////////// Data Structures /////////////////

    // Enum for voting on the proposed transaction
    enum Vote {
        No, // 0 -> Vote against the proposed transaction
        Yes // 1 -> Vote in favor of the proposed transaction
    }

    // Struct for the campaign which contains all the details of the campaign
    struct Campaign {
        address owner; // owner of the campaign
        string title; // title of the campaign
        string description; // description of the campaign
        uint256 goal; // target goal of the campaign
        uint256 balance; // current balance of the campaign
        uint256 deadline; // deadline of the campaign
        bool active; // status of the campaign
        bool isTransactionProposed; // status of the transaction
        bool isTransactionExecuted; // status of the transaction
        uint256 id; // id of the campaign for identifying each campaign uniquely
    }

    // Struct for the donation which contains the donator address and the amount donated
    struct Donation {
        address donor; // address of the donator
        uint256 amount; // amount donated
    }

    // Struct for the vote which contains the voter address and the vote
    struct VoteStruct {
        address voter; // address of the voter
        Vote vote; // vote of the voter (0 -> No, 1 -> Yes)
    }

    // Struct for the campaign vote which contains the number of yes and no votes (used for efficient vote counting)
    struct CampaignVote {
        uint256 yesVotes; // number of yes votes
        uint256 noVotes; // number of no votes
    }

    // Struct for the transaction which contains the recipient address, amount, and description which is proposed by the owner
    struct Transaction {
        address payable recipient; // address of the recipient (in which further the amount will be transferred)
        uint256 amount; // amount to be transferred
        string description; // description of the transaction
    }

    Campaign[] public s_campaigns; // array of campaigns (storage)

    // mappings for efficient data retrieval
    mapping(uint256 => Donation[]) public s_campaignIdToDonations; // campaignId -> donations
    mapping(uint256 => Transaction[]) public s_campaignIdToTransactions; // campaignId -> transactions
    mapping(uint256 => VoteStruct[]) public s_campaignIdToVotes; // campaignId -> votes
    mapping(uint256 => mapping(address => bool))
        public s_campaignIdToVoterToHasVoted; // campaignId -> voter -> hasVoted
    mapping(uint256 => CampaignVote) public s_campaignIdToVotesCount; // campaignId -> votesCount
    mapping(uint256 => mapping(address => uint256))
        public s_campaignIdToDonatorToDonations; // campaignId -> donator -> donations

    // NOTE 20% of the goal is for approximation as we are dealing with floating point numbers and this can be changed as per the requirement
    uint16 constant DEDUCED_THRESHOLD_PERCENT = 20; // 20% of the goal

    /// @notice This function is used to create a campaign by the owner
    /// @dev It validates the input parameters and reverts with the error message if the validation fails. It emits the `CampaignCreated` event
    /// @param _title Title of the campaign
    /// @param _description Description of the campaign
    /// @param _goal Target goal of the campaign
    /// @param _deadline Deadline of the campaign
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadline
    ) public {
        // validate the input parameters
        if (_deadline < block.timestamp) {
            revert EduFund__Errors.InvalidDeadline();
        }
        if (_goal == 0) {
            revert EduFund__Errors.TargetGoalMustBeGreaterThanZero();
        }
        if (bytes(_title).length == 0 || bytes(_description).length == 0) {
            revert EduFund__Errors.TitleAndDescriptionCannotBeEmpty();
        }

        uint256 len = s_campaigns.length; // reading storage variable once to save gas
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

    /// @notice It takes the campaignId and the amount to donate and donates the amount to the campaign
    /// @param _campaignId - id of the campaign
    function donate(
        uint256 _campaignId
    )
        public
        payable
        checkCampaignExpiration(_campaignId, true)
        alreadyDonated(_campaignId)
    {
        // validate the input parameters
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

        campaign.balance += msg.value; // update the balance of the campaign
        s_campaignIdToDonations[_campaignId].push(
            Donation(msg.sender, msg.value)
        ); // add the donation to the campaign
        s_campaignIdToDonatorToDonations[_campaignId][msg.sender] += msg.value; // add the donation to the donator

        emit Events.DonationReceived(msg.sender, msg.value, _campaignId);
    }

    /// @notice This function is used to propose a transaction by the owner
    /// @dev It validates the input parameters and reverts with the error message if the validation fails. It uses the `onlyOwner` and `checkCampaignExpiration` modifiers
    /// @param _campaignId Id of the campaign
    /// @param _recipients Array of recipient addresses
    /// @param _amounts Array of amounts to be transferred
    /// @param _descriptions Array of descriptions of the transactions
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
                // recipient cannot be a donator
                revert EduFund__Errors.RecipientCannotBeDonator();
            } else {
                s_campaignIdToTransactions[_campaignId].push(
                    Transaction(_recipients[i], _amounts[i], _descriptions[i])
                );
            }
        }
        campaign.isTransactionProposed = true; // update the status of the transaction
        campaign.active = false; // make the campaign inactive after the transaction is proposed

        emit Events.TransactionProposed(
            msg.sender,
            _campaignId,
            _recipients,
            _amounts,
            _descriptions
        );
    }

    /// @notice This function is used to vote on the proposed transaction
    /// @dev It validates the input parameters and reverts with the error message if the validation fails.
    /// @param _campaignId Id of the campaign
    /// @param v Vote of the donator (0 -> No, 1 -> Yes)
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
        s_campaignIdToVoterToHasVoted[_campaignId][msg.sender] = true; // update the status of the voter
        // counting the votes while voting for further efficiency
        if (v == Vote.Yes) {
            s_campaignIdToVotesCount[_campaignId].yesVotes++;
        } else {
            s_campaignIdToVotesCount[_campaignId].noVotes++;
        }
        s_campaignIdToVotes[_campaignId].push(VoteStruct(msg.sender, v)); // add the vote to the campaign

        emit Events.CampaignVoted(
            msg.sender,
            _campaignId,
            s_campaignIdToVotes[_campaignId].length - 1,
            v == Vote.Yes
        );
    }

    /// @notice This function is used to finalize the transaction by validating the votes and executing the transaction. If the votes are in favor of the transaction, the transaction is executed and the funds are transferred to the recipient. If the votes are against the transaction, the funds are refunded to the donators
    /// @dev This function is uses most gas as it is the final step of the process and it is used to execute the transaction
    /// @param _campaignId Id of the campaign
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
            // execute the transaction and transfer the funds to the recipient
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
        campaign.isTransactionExecuted = true; // update the status of the campaign
    }

    /// @notice This function is used to make the campaign inactive
    /// @param _campaignId Id of the campaign
    function makeCampaignInactive(
        uint256 _campaignId
    ) public onlyOwner(_campaignId) {
        s_campaigns[_campaignId].active = false; // updates the status of the campaign
        emit Events.CampaignMadeInactive(_campaignId);
    }

    //////////////////// Getters Functions ////////////////////

    /// @notice This function is used to get all the campaigns
    /// @return Campaign[] Array of all the campaigns
    function getCampaigns() public view returns (Campaign[] memory) {
        return s_campaigns;
    }

    /// @notice This function is used to get the donators of the campaign
    /// @param _campaignId Id of the campaign
    /// @return donators of the campaign
    function getCampaignDonators(
        uint256 _campaignId
    ) public view returns (Donation[] memory) {
        return s_campaignIdToDonations[_campaignId];
    }

    /// @notice This function is used to get the voters of the campaign
    /// @param _campaignId Id of the campaign
    /// @return all voters of the campaign
    function getVoters(
        uint256 _campaignId
    ) public view returns (VoteStruct[] memory) {
        return s_campaignIdToVotes[_campaignId];
    }

    /// @notice This function is used to get the proposed transactions of the campaign
    /// @param _campaignId Id of the campaign
    /// @return all proposed transactions of the campaign
    function getProposalTransactions(
        uint256 _campaignId
    ) public view returns (Transaction[] memory) {
        return s_campaignIdToTransactions[_campaignId];
    }

    /// @notice This function is used to get the voted campaign of caller address
    /// @return votedCampaigns of the caller
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

    /// @notice This function is used to get the finalized campaigns
    /// @return finalizedCampaigns of the caller
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

    /// @notice This function is used to get the campaigns which are ready to finalize the transaction
    /// @return readyToFinalizeCampaigns of the caller
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

    /// @notice This function is used to get the donator donations for all the campaigns
    /// @return donatorDonations of the caller
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
    //////////////////// Internal Functions ////////////////////

    /// @notice This function is used to calculate the percentage amount of the goal
    /// @param amount Amount to calculate the percentage
    /// @return ans Percentage amount
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

    /// @notice This modifier is used to check the campaign expiration
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

    /// @notice This modifier is used to check the owner of the campaign
    modifier onlyOwner(uint256 _campaignId) {
        if (s_campaigns[_campaignId].owner != msg.sender) {
            revert EduFund__Errors.InvalidCampaignOwner();
        }
        _;
    }

    /// @notice This modifier is used to check the donator of the campaign
    modifier onlyDonator(uint256 _campaignId) {
        if (s_campaignIdToDonatorToDonations[_campaignId][msg.sender] == 0) {
            revert EduFund__Errors.OnlyDonatorsCanVote();
        }
        if (s_campaignIdToVoterToHasVoted[_campaignId][msg.sender]) {
            revert EduFund__Errors.CampaignAlreadyVoted();
        }
        _;
    }

    /// @notice This modifier is used to check if the donator has already donated to the campaign
    modifier alreadyDonated(uint256 _campaignId) {
        if (s_campaignIdToDonatorToDonations[_campaignId][msg.sender] > 0) {
            revert EduFund__Errors.DonatorAlreadyDonated();
        }
        _;
    }
}
