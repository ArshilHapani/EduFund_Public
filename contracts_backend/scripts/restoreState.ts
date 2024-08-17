import { ethers } from "hardhat";

import {
  donateCampaign,
  getCampaignAndCampaignId,
  proposeTransaction,
  Vote,
  voteCampaign,
} from "../utils/helper";
import addresses from "../../client/src/lib/addresses.json";

(async function () {
  const eduFund = await ethers.getContractAt(
    "EduFund",
    addresses.localhost.EduFund
  );

  const signers = await ethers.getSigners();

  const { campaignId } = await getCampaignAndCampaignId(eduFund);

  console.log(`Campaign created with id: ${campaignId}`);
  await donateCampaign(eduFund, signers, campaignId, 8);

  await proposeTransaction(eduFund, signers, campaignId);
  await voteCampaign(eduFund, signers, campaignId, 8, Vote.NO);
})();
