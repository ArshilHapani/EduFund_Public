import { ethers } from "hardhat";
import { expect } from "chai";

import { EduFund } from "../typechain-types";

type CampaignType = Awaited<ReturnType<EduFund["createCampaign"]>>;

type Signers = Awaited<ReturnType<typeof ethers.getSigners>>;

const DUMMY_CAMPAIGN = {
  title: "Test Campaign",
  description: "Test Description",
  targetAmount: 2,
  // 1 hour from now
  deadline: Math.floor(Date.now() / 1000) + 3600,
};
const NEGATIVE_DEADLINE = Math.floor(Date.now() / 1000) - 3600;

describe("EduFund", function () {
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

    it("It should revert if someone tries to vote who is not donator", async function () {
      await donateCampaign(eduFund, signers, campaignId);
      await expect(eduFund.vote(campaignId, 0)).to.be.revertedWithCustomError(
        { interface: _interface },
        "OnlyDonatorsCanVote"
      );
    });

    it("It only allows voting if transaction campaign is proposed", async function () {
      await donateCampaign(eduFund, signers, campaignId);
      await proposeTransaction(eduFund, signers, campaignId);
    });

    it("It should updates the `s_campaignIdToVotes` mapping", async function () {
      await donateCampaign(eduFund, signers, campaignId);
      await proposeTransaction(eduFund, signers, campaignId);

      await eduFund.connect(signers[4]).vote(campaignId, 1);
      const vote = await eduFund.s_campaignIdToVotes(campaignId, 0);

      expect(vote.voter).to.equal(signers[4].address);
      expect(vote.vote).to.equal(1);
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

    it(`It should emit an event`, async function () {
      await donateCampaign(eduFund, signers, campaignId);
      await proposeTransaction(eduFund, signers, campaignId);
      expect(eduFund.connect(signers[4]).vote(campaignId, 1)).to.be.emit(
        eduFund,
        "CampaignVoted"
      );
    });

    describe("Finalize function", function () {
      it("It should invoke `finalizeTransaction` method once all donators have vote for their opinion", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);
        await voteCampaign(eduFund, signers, campaignId, 16);

        await expect(
          eduFund.connect(signers[17]).vote(campaignId, 0)
        ).to.be.emit(eduFund, "FinalizingTransaction");
      });

      it("It should transfer the amount to the recipient if majority donators have voted for yes", async function () {
        await donateCampaign(eduFund, signers, campaignId);
        await proposeTransaction(eduFund, signers, campaignId);
        const balanceBefore = await ethers.provider.getBalance(
          signers[18].address
        );
        await voteCampaign(eduFund, signers, campaignId);

        const balanceAfter = await ethers.provider.getBalance(
          signers[18].address
        );

        expect(balanceAfter).to.be.gt(balanceBefore);
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

// Helper functions

function parseUnits(amount: number) {
  return ethers.parseEther(amount.toString());
}

function parseWei(amount: bigint) {
  return ethers.formatEther(amount);
}

async function increaseTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []); // Mines a new block to reflect the time change
}

async function getCampaignAndCampaignId(eduFund: EduFund) {
  const campaign = await eduFund.createCampaign(
    DUMMY_CAMPAIGN.title,
    DUMMY_CAMPAIGN.description,
    parseUnits(DUMMY_CAMPAIGN.targetAmount),
    DUMMY_CAMPAIGN.deadline
  );
  const tx = await campaign.wait();
  const campaignId = (tx?.logs[0] as any).args[1];

  return {
    campaign,
    campaignId,
  };
}

async function donateCampaign(
  eduFund: EduFund,
  signers: Signers,
  campaignId: number,
  numDonors = 17
) {
  for (let i = 1; i <= numDonors; i++) {
    await eduFund
      .connect(signers[i])
      .donate(campaignId, { value: parseUnits(0.1) });
  }
}

async function voteCampaign(
  eduFund: EduFund,
  signers: Signers,
  campaignId: number,
  numDonors = 17
) {
  for (let i = 1; i <= numDonors; i++) {
    await eduFund.connect(signers[i]).vote(campaignId, 1);
  }
}

async function proposeTransaction(
  eduFund: EduFund,
  signers: Signers,
  campaignId: number
) {
  await eduFund.proposeTransactions(
    campaignId,
    [signers[18].address, signers[19].address],
    [parseUnits(0.1), parseUnits(0.1)],
    ["For anime manga", "For anime manga"]
  );
}
