import { ethers } from "hardhat";

(async function () {
  const CounterFactory = await ethers.getContractFactory("Counter");
  const counter = await CounterFactory.deploy();
  await counter.waitForDeployment();

  console.log("Counter deployed to:", await counter.getAddress());
  let counterValue = await counter.count();
  console.log(`counter value ${counterValue}`);
  // increment
  await counter.increment();
  counterValue = await counter.count();
  console.log(`counter value after increment ${counterValue}`);
  await counter.decrement();
  counterValue = await counter.count();
  console.log(`counter value after decrement ${counterValue}`);
})();
