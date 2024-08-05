import { ethers } from "hardhat";

(async function () {
  const CounterFactory = await ethers.getContractFactory("Counter");
  const counter = await CounterFactory.deploy();
  await counter.waitForDeployment();

  console.log("Counter deployed to:", await counter.getAddress());
})();
