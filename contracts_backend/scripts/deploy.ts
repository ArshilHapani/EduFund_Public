import { ethers, network } from "hardhat";

import verifyContract from "../utils/verify";

(async function () {
  const EduFund = await ethers.getContractFactory("EduFund");
  const eduFund = await EduFund.deploy();
  await eduFund.waitForDeployment();

  const campaign = await eduFund.createCampaign(
    "Title",
    "Description",
    1000,
    // 1 hour from now
    Math.floor(Date.now() / 1000) + 3600
  );
  const tx = await campaign.wait(1);

  const campaignId = (tx?.logs[0] as any).args[1];
  console.log(campaignId);
})();
