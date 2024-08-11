import { ethers, network } from "hardhat";

import verifyContract from "../utils/verify";

(async function () {
  const CounterFactory = await ethers.getContractFactory("Counter");
  const counter = await CounterFactory.deploy(180n);
  await counter.waitForDeployment();

  let address = await counter.getAddress();
  console.log("Counter deployed to:", address);

  if (network.name === "arbitrum") {
    console.log("Verifying contract on etherscan...");
    await verifyContract(address, []);
  }
})();
