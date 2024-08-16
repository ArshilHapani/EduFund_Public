import { ethers } from "hardhat";
import { expect } from "chai";

import { EduFund } from "../typechain-types";
import {
  Signers,
  CampaignType,
  DUMMY_CAMPAIGN,
  NEGATIVE_DEADLINE,
  Vote,
  donateCampaign,
  getCampaignAndCampaignId,
  getDonatorsBalance,
  getRecipientBalance,
  increaseTime,
  parseUnits,
  proposeTransaction,
  voteCampaign,
} from "../utils/helper";

describe("EduFund unit tests", function () {
  let eduFund: EduFund;
  let _interface: EduFund["interface"];

  beforeEach(async function () {
    const EduFund = await ethers.getContractFactory("EduFund");
    eduFund = await EduFund.deploy();
    _interface = eduFund.interface;
    await eduFund.waitForDeployment();
  });

  describe("Contract deployment", function () {
    it("Should deploy the contract", async function () {
      expect(await eduFund.getAddress()).to.properAddress;
    });
  });
  describe("`createCampaign` function", function () {
    describe("Invalid inputs", function () {
      it("Should not create a campaign with an empty title and or description", async function () {
        await expect(
          eduFund.createCampaign(
            "",
            DUMMY_CAMPAIGN.description,
            parseUnits(DUMMY_CAMPAIGN.targetAmount),
            DUMMY_CAMPAIGN.deadline
          )
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "TitleAndDescriptionCannotBeEmpty"
        );

        await expect(
          eduFund.createCampaign(
            DUMMY_CAMPAIGN.title,
            "",
            parseUnits(DUMMY_CAMPAIGN.targetAmount),
            DUMMY_CAMPAIGN.deadline
          )
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "TitleAndDescriptionCannotBeEmpty"
        );
      });

      it("Should not create a campaign with a negative deadline", async function () {
        await expect(
          eduFund.createCampaign(
            DUMMY_CAMPAIGN.title,
            DUMMY_CAMPAIGN.description,
            parseUnits(DUMMY_CAMPAIGN.targetAmount),
            NEGATIVE_DEADLINE
          )
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "InvalidDeadline"
        );
      });

      it("Should not create a campaign with a target amount of 0", async function () {
        await expect(
          eduFund.createCampaign(
            DUMMY_CAMPAIGN.title,
            DUMMY_CAMPAIGN.description,
            parseUnits(0),
            DUMMY_CAMPAIGN.deadline
          )
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "TargetGoalMustBeGreaterThanZero"
        );
      });
    });

    describe("Valid inputs and updates", function () {
      let campaign: CampaignType;
      beforeEach(async function () {
        campaign = await eduFund.createCampaign(
          DUMMY_CAMPAIGN.title,
          DUMMY_CAMPAIGN.description,
          parseUnits(DUMMY_CAMPAIGN.targetAmount),
          DUMMY_CAMPAIGN.deadline
        );
      });
      it("Should create a campaign", async function () {
        expect(campaign).to.be.an("object");
      });
      it("Campaign must have a hash", function () {
        expect(campaign).to.haveOwnProperty("hash");
      });
      it("Must emits an event", async function () {
        expect(
          await eduFund.createCampaign(
            DUMMY_CAMPAIGN.title,
            DUMMY_CAMPAIGN.description,
            parseUnits(DUMMY_CAMPAIGN.targetAmount),
            DUMMY_CAMPAIGN.deadline
          )
        ).to.be.emit(eduFund, "CampaignCreated");
      });
      it("Must updates the record of `s_campaigns` array", async function () {
        const [
          owner,
          title,
          description,
          goal,
          balance,
          deadline,
          active,
          isTransactionProposed,
          isTransactionExecuted,
        ] = await eduFund.s_campaigns(0);
        expect(owner).to.be.properAddress;
        expect(title).to.equal(DUMMY_CAMPAIGN.title);
        expect(description).to.equal(DUMMY_CAMPAIGN.description);
        expect(goal).to.equal(parseUnits(DUMMY_CAMPAIGN.targetAmount));
        expect(balance).to.equal(0);
        expect(deadline).to.equal(DUMMY_CAMPAIGN.deadline);
        expect(active).to.equal(true);
        expect(isTransactionProposed).to.equal(false);
        expect(isTransactionExecuted).to.equal(false);
      });
    });
  });

  describe("`proposeTransactions` function", function () {
    let campaignId: number;
    let signers: Signers;

    beforeEach(async function () {
      signers = await ethers.getSigners();
      ({ campaignId } = await getCampaignAndCampaignId(eduFund));
    });
    describe("Validate inputs", function () {
      let campaignId: number;
      let signers: Signers;

      beforeEach(async function () {
        signers = await ethers.getSigners();
        ({ campaignId } = await getCampaignAndCampaignId(eduFund));
      });
      it("It should revert if the data is of inconsistent length", async function () {
        await expect(
          eduFund.proposeTransactions(
            campaignId,
            [signers[4].address],
            [],
            []
          ) /* It can be either [],[],[] or [_][][] or any possible combination */
        ).to.be.revertedWithCustomError(
          {
            interface: _interface,
          },
          "InconsistentArrayLength"
        );

        await expect(
          eduFund.proposeTransactions(
            campaignId,
            [],
            [],
            []
          ) /* It can be either [],[],[] or [_][][] or any possible combination */
        ).to.be.revertedWithCustomError(
          {
            interface: _interface,
          },
          "InconsistentArrayLength"
        );
      });

      it("It should revert if balance is less than the minimum threshold (20%)", async function () {
        // 20% less than target
        function calculatePercentageAmount(amount: number, percentage: number) {
          return (amount * percentage) / 100;
        }
        const amountToLessThanTarget =
          DUMMY_CAMPAIGN.targetAmount -
          calculatePercentageAmount(
            DUMMY_CAMPAIGN.targetAmount,
            20.00000000001 // 20.000000000000001 is threshold
          );
        await eduFund.donate(campaignId, {
          value: parseUnits(amountToLessThanTarget),
        });
        await expect(
          eduFund.proposeTransactions(
            campaignId,
            [signers[4].address, signers[5].address],
            [parseUnits(0.1), parseUnits(0.1)],
            ["For anime manga", "For anime manga"]
          )
        ).to.be.revertedWithCustomError(
          {
            interface: _interface,
          },
          "InsufficientBalanceForProposingTransaction"
        );
      });

      it("It should add transaction on `s_campaignIdToTransactions` array", async function () {
        await eduFund.donate(campaignId, { value: parseUnits(1.6) });
        await eduFund.proposeTransactions(
          campaignId,
          [signers[4].address, signers[5].address],
          [parseUnits(0.1), parseUnits(0.1)],
          ["For anime manga", "For anime manga"]
        );
        const [donator, amount, description] =
          await eduFund.s_campaignIdToTransactions(campaignId, 0);
        expect(donator).to.equal(signers[4].address);
        expect(amount).to.equal(parseUnits(0.1));
        expect(description).to.equal("For anime manga");
      });
      it("It should updates the campaign fields `isTransactionProposed` and `active`", async function () {
        await eduFund.donate(campaignId, { value: parseUnits(1.6) });
        await eduFund.proposeTransactions(
          campaignId,
          [signers[4].address, signers[5].address],
          [parseUnits(0.1), parseUnits(0.1)],
          ["For anime manga", "For anime manga"]
        );
        const [, , , , , , active, isTransactionProposed] =
          await eduFund.s_campaigns(campaignId);
        expect(active).to.equal(false);
        expect(isTransactionProposed).to.equal(true);
      });
      it("It should emit an event", async function () {
        await eduFund.donate(campaignId, { value: parseUnits(1.6) });
        expect(
          eduFund.proposeTransactions(
            campaignId,
            [signers[4].address, signers[5].address],
            [parseUnits(0.1), parseUnits(0.1)],
            ["For anime manga", "For anime manga"]
          )
        ).to.be.emit(eduFund, "TransactionProposed");
      });
    });
  });

  describe("`vote` function", function () {
    let campaignId: number;
    let signers: Signers;
    beforeEach(async function () {
      signers = await ethers.getSigners();
      ({ campaignId } = await getCampaignAndCampaignId(eduFund));
    });
    describe("Input validation", function () {
      it("It should revert if someone tries to vote who is not donator", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await expect(eduFund.vote(campaignId, 0)).to.be.revertedWithCustomError(
          { interface: _interface },
          "OnlyDonatorsCanVote"
        );
      });

      it("It only allows voting if transaction campaign is proposed", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await expect(
          eduFund.connect(signers[4]).vote(campaignId, Vote.YES)
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "TransactionIsNotYetProposed"
        );
      });

      it("It should not allow to vote more than once", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);

        await eduFund.connect(signers[4]).vote(campaignId, 1);
        await expect(
          eduFund.connect(signers[4]).vote(campaignId, 1)
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "CampaignAlreadyVoted"
        );
      });

      it("It should not allow recipient to be donor", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await expect(
          eduFund.proposeTransactions(
            campaignId,
            [signers[4].address, signers[4].address],
            [parseUnits(0.1), parseUnits(0.1)],
            ["For anime manga", "For anime manga"]
          )
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "RecipientCannotBeDonator"
        );
      });
    });
    describe("Mutation validation", function () {
      it("It should updates the `s_campaignIdToVotes` mapping", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);

        await eduFund.connect(signers[4]).vote(campaignId, 1);
        const vote = await eduFund.s_campaignIdToVotes(campaignId, 0);

        expect(vote.voter).to.equal(signers[4].address);
        expect(vote.vote).to.equal(1);
      });

      it(`It should emit an event`, async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);
        expect(eduFund.connect(signers[4]).vote(campaignId, 1)).to.be.emit(
          eduFund,
          "CampaignVoted"
        );
      });
    });
  });

  describe("`Finalize function", function () {
    let campaignId: number;
    let signers: Signers;
    let campaign: CampaignType;
    beforeEach(async function () {
      ({ campaign, campaignId } = await getCampaignAndCampaignId(eduFund));
      signers = await ethers.getSigners();
    });

    describe("Input validation", function () {
      it("It should only allow owner to finalize the campaign", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);
        await voteCampaign(eduFund, signers, campaignId);
        await expect(
          eduFund.connect(signers[1]).finalizeTransaction(campaignId)
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "InvalidCampaignOwner"
        );
      });

      it("It should only allow to finalize the campaign if the transaction is proposed", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await expect(
          eduFund.finalizeTransaction(campaignId)
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "TransactionIsNotYetProposed"
        );
      });
      it("It should only allow to finalize the transaction if it contain enough votes", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);
        await expect(
          eduFund.finalizeTransaction(campaignId)
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "InsufficientVotes"
        );
      });
    });

    describe("Mutation validation and fund transfer validation", function () {
      let campaignId: number;
      let eduFund: EduFund;

      beforeEach(async function () {
        const EduFund = await ethers.getContractFactory("EduFund");
        eduFund = await EduFund.deploy();
        await eduFund.waitForDeployment();
        ({ campaignId, campaign } = await getCampaignAndCampaignId(eduFund));
      });
      it("It should transfer the funds to the recipient if majority votes are in favor", async function () {
        const numberOfDonator = 10; // threshold (more donators lead to gas limit error)
        await donateCampaign(eduFund, signers, campaignId, numberOfDonator);
        await proposeTransaction(eduFund, signers, campaignId);
        await voteCampaign(
          eduFund,
          signers,
          campaignId,
          numberOfDonator,
          Vote.YES
        );
        const beforeBalances = await getRecipientBalance();
        await eduFund.finalizeTransaction(campaignId);
        const afterBalances = await getRecipientBalance();

        beforeBalances.forEach((balance, idx) => {
          expect(afterBalances[idx]).to.be.gt(balance);
        });
      });

      it("It should transfer funds back to the donators if majority votes are against", async function () {
        const numOfDonors = 2;
        const [beforeBalance1, beforeBalance2] = await getDonatorsBalance(
          numOfDonors
        );
        const [ug11, ug12] = await donateCampaign(
          eduFund,
          signers,
          campaignId,
          2,
          DUMMY_CAMPAIGN.targetAmount
        );
        await proposeTransaction(eduFund, signers, campaignId);
        const [ug21, ug22] = await voteCampaign(
          eduFund,
          signers,
          campaignId,
          numOfDonors,
          Vote.NO
        );
        const [br1, br2] = await getRecipientBalance();
        await eduFund.finalizeTransaction(campaignId);
        const [ar1, ar2] = await getRecipientBalance();
        const [afterBalance1, afterBalance2] = await getDonatorsBalance(
          numOfDonors
        );

        expect(afterBalance1 + ug11 + ug21).to.be.lte(beforeBalance1);
        expect(afterBalance2 + ug12 + ug22).to.be.lte(beforeBalance2);
        expect(br1).to.be.equal(ar1);
        expect(br2).to.be.equal(ar2);
      });

      it("It should update the `isTransactionExecuted` flag to true after finalizing transaction", async function () {
        const numberOfDonator = 2;
        await donateCampaign(eduFund, signers, campaignId, numberOfDonator);
        await proposeTransaction(eduFund, signers, campaignId);
        await voteCampaign(
          eduFund,
          signers,
          campaignId,
          numberOfDonator,
          Vote.YES
        );
        await eduFund.finalizeTransaction(campaignId);
        const campaign = await eduFund.s_campaigns(campaignId);
        expect(campaign.isTransactionExecuted).to.be.true;
      });
    });
  });

  describe("`donate` function", function () {
    let campaign: CampaignType;
    let campaignId: number;
    beforeEach(async function () {
      campaign = await eduFund.createCampaign(
        DUMMY_CAMPAIGN.title,
        DUMMY_CAMPAIGN.description,
        parseUnits(DUMMY_CAMPAIGN.targetAmount),
        DUMMY_CAMPAIGN.deadline
      );
      const tx = await campaign.wait();
      campaignId = (tx?.logs[0] as any).args[1];
    });

    describe("Valid inputs and updates", function () {
      it("It should update the balance of the campaign", async function () {
        await eduFund.donate(campaignId, { value: parseUnits(1) });
        const [, , , , balance, , , ,] = await eduFund.s_campaigns(campaignId);
        expect(balance).to.equal(parseUnits(1));
      });
      it("It should emit an event", async function () {
        expect(eduFund.donate(campaignId, { value: parseUnits(1) })).to.be.emit(
          eduFund,
          "DonationReceived"
        );
      });
      it("It should update the `s_campaignIdToDonations` , `s_campaignIdToDonatorToDonations`  mapping with one donation and emits an event", async function () {
        const signers = await ethers.getSigners();
        await eduFund
          .connect(signers[2])
          .donate(campaignId, { value: parseUnits(1) });

        const [prevDonator, prevDonation] =
          await eduFund.s_campaignIdToDonations(0, campaignId);
        const amount = await eduFund.s_campaignIdToDonatorToDonations(
          campaignId,
          prevDonator
        );

        expect(prevDonator).to.equal(signers[2].address);
        expect(prevDonation).to.equal(parseUnits(1));
        expect(amount).to.equal(parseUnits(1));
      });

      it("It should not allow same donator to donate more than once", async function () {
        const signers = await ethers.getSigners();
        await eduFund
          .connect(signers[2])
          .donate(campaignId, { value: parseUnits(1) });
        await expect(
          eduFund
            .connect(signers[2])
            .donate(campaignId, { value: parseUnits(1) })
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "DonatorAlreadyDonated"
        );
      });

      it("Should not allow to donate after the target amount is reached", async function () {
        await expect(
          eduFund.donate(campaignId, {
            value: parseUnits(DUMMY_CAMPAIGN.targetAmount + 1),
          })
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "CampaignGoalReached"
        );
      });
    });

    describe("Invalid inputs", function () {
      it("Should not allow to donate `0` amount", async function () {
        await expect(
          eduFund.donate(campaignId, { value: parseUnits(0) })
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "ContributionMustBeGreaterThanZero"
        );
      });
      it("Should not allow to donate to a non-existing campaign", async function () {
        await expect(eduFund.donate(1000, { value: parseUnits(1) })).to.be
          .reverted;
      });
      it("Should not allow to donate on inactive campaign", async function () {
        await eduFund.makeCampaignInactive(campaignId);
        await expect(
          eduFund.donate(campaignId, { value: parseUnits(1) })
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "CampaignNotActive"
        );
      });
      it("Should not allow to donate after the deadline", async function () {
        let AnotherEduFund = await ethers.getContractFactory("EduFund");
        let anotherEduFund = await AnotherEduFund.deploy();
        await anotherEduFund.waitForDeployment();
        const campaign = await anotherEduFund.createCampaign(
          DUMMY_CAMPAIGN.title,
          DUMMY_CAMPAIGN.description,
          parseUnits(DUMMY_CAMPAIGN.targetAmount),
          Math.floor(Date.now() / 1000) + 3600
        );
        const tx = await campaign.wait();
        const anotherCampaignId = (tx?.logs[0] as any).args[1];

        // await increaseTime(3570);  // throws error (-30 threshold)
        await increaseTime(3600);
        await expect(
          anotherEduFund.donate(anotherCampaignId, { value: parseUnits(1) })
        ).to.be.revertedWithCustomError(
          { interface: _interface },
          "CampaignExpired"
        );
      });
    });
  });
});
