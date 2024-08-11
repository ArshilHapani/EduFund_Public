import { run } from "hardhat";

export default async function verifyContract(
  contractAddress: string,
  args: any
) {
  console.log("Verifying contract on etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified"))
      console.log("Contract already verified");
    else console.error(error);
  }
}

// verify the passed hashed address string with regex
export function verifyAddress(address: string) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}
