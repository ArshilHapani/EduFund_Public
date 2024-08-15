import { ethers } from "hardhat";
import { getCampaignAndCampaignId } from "../utils/helper";

import addresses from "../../client/src/lib/addresses.json";

(async function () {
  const eduFund = await ethers.getContractAt(
    "EduFund",
    addresses.localhost.EduFund
  );

  const signers = await ethers.getSigners();

  const { campaign, campaignId } = await getCampaignAndCampaignId(eduFund);

  console.log(`Campaign created with id: ${campaignId}`);
  await eduFund
    .connect(signers[1])
    .donate(campaignId, { value: ethers.parseEther("1") });
  await eduFund
    .connect(signers[2])
    .donate(campaignId, { value: ethers.parseEther("1") });

  await eduFund.proposeTransactions(
    campaignId,
    [signers[18]],
    [ethers.parseEther("2")],
    ["test"]
  );

  await eduFund.connect(signers[1]).vote(campaignId, 1);
  await eduFund.connect(signers[2]).vote(campaignId, 0);
})();
