import { ethers } from "hardhat";
import { expect } from "chai";

import {
  getCampaignAndCampaignId,
  donateCampaign,
  getDonatorsBalance,
  proposeTransaction,
  CampaignTypeRaw,
  Vote,
  getRecipientBalance,
} from "../utils/helper";

describe("EduFund stage test", function () {
  it("It should create campaign, add donation, propose transaction, votes on campaign and finalize the transaction", async function () {
    // deploying contract
    const EduFund = await ethers.getContractFactory("EduFund");
    const eduFund = await EduFund.deploy();
    const signers = await ethers.getSigners();
    await eduFund.waitForDeployment();
    expect(await eduFund.getAddress()).to.be.a("string");

    // creating campaign
    const { campaignId } = await getCampaignAndCampaignId(eduFund);
    expect(campaignId).to.be.a("bigint");

    // donate to campaign
    const prevBalance = await getDonatorsBalance(17);
    await donateCampaign(eduFund, signers, campaignId);
    const afterBalance = await getDonatorsBalance(17);
    afterBalance.forEach((balance, idx) => {
      expect(balance).to.be.lt(prevBalance[idx]);
    });

    // proposing transaction
    let campaign: CampaignTypeRaw;
    campaign = await eduFund.s_campaigns(campaignId);
    expect(campaign.isTransactionProposed).to.be.false;
    await proposeTransaction(eduFund, signers, campaignId);
    campaign = await eduFund.s_campaigns(campaignId);
    expect(campaign.isTransactionProposed).to.be.true;
    expect(campaign.active).to.be.false;

    // voting on campaign
    await eduFund.connect(signers[1]).vote(campaignId, Vote.NO);
    const prevVote = await eduFund.s_campaignIdToVotes(campaignId, 0);
    expect(prevVote[1]).to.be.eq(0);
    await eduFund.connect(signers[2]).vote(campaignId, Vote.YES);
    const afterVote = await eduFund.s_campaignIdToVotes(campaignId, 1);
    expect(afterVote[1]).to.be.eq(1);
    // last vote for transaction finality
    await eduFund.connect(signers[3]).vote(campaignId, Vote.YES);

    // finalizing transaction
    const [b1, b2] = await getRecipientBalance();
    await eduFund.finalizeTransaction(campaignId);
    const [a1, a2] = await getRecipientBalance();
    campaign = await eduFund.s_campaigns(campaignId);
    expect(campaign.isTransactionExecuted).to.be.true;
    expect(a1).to.be.gt(b1);
    expect(a2).to.be.gt(b2);
  });
});
