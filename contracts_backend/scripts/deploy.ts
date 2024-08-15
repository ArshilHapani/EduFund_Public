import { ethers, network } from "hardhat";
import fs from "node:fs";
import path from "path";
import abi from "../artifacts/contracts/EduFund.sol/EduFund.json";
import verifyContract from "../utils/verify";

(async function () {
  const EduFund = await ethers.getContractFactory("EduFund");
  const eduFund = await EduFund.deploy();
  await eduFund.deploymentTransaction()?.wait(); // Wait for deployment

  const networkName = network.name;
  const eduFundAddress = await eduFund.getAddress();
  // const eduFundABI = EduFund.interface.fragments; // ABI extraction for ethers v6

  console.log(`Network: ${networkName}`);
  console.log(`EduFund deployed to: ${eduFundAddress}`);

  if (network.name === "sepolia" || network.name === "opencampus") {
    await verifyContract(await eduFund.getAddress(), []);
  }

  await storeContractAddressAndABI(eduFundAddress);
})();

export async function storeContractAddressAndABI(address: string) {
  const addressesFilePath = path.resolve(
    __dirname,
    "../../client/src/lib/addresses.json"
  );

  const abiFilePath = path.resolve(__dirname, "../../client/src/lib/abi.json");

  let addresses: Record<string, any> = {};
  if (fs.existsSync(addressesFilePath)) {
    addresses = JSON.parse(fs.readFileSync(addressesFilePath, "utf8"));
  }

  addresses[network.name] = {
    ...addresses[network.name],
    EduFund: address,
  };

  fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2));

  // Stream to write ABI
  const abiWriteStream = fs.createWriteStream(abiFilePath, { flags: "w" });

  abiWriteStream.write("{\n");
  abiWriteStream.write(`  "EduFund": ${JSON.stringify(abi.abi, null, 2)}\n`);
  abiWriteStream.write("}\n");

  abiWriteStream.end();

  abiWriteStream.on("finish", () => {
    console.log("ABI has been written to abi.json");
  });

  abiWriteStream.on("error", (err) => {
    console.error("Error writing ABI to file:", err);
  });
}
