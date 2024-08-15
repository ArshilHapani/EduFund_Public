import { ethers } from "hardhat";
import { EduFund } from "../typechain-types";

export type CampaignType = Awaited<ReturnType<EduFund["createCampaign"]>>;
export type Signers = Awaited<ReturnType<typeof ethers.getSigners>>;
export enum Vote {
  YES = 1,
  NO = 0,
}
export type CampaignTypeRaw = [
  string,
  string,
  string,
  bigint,
  bigint,
  bigint,
  boolean,
  boolean,
  boolean,
  bigint
] & {
  owner: string;
  title: string;
  description: string;
  goal: bigint;
  balance: bigint;
  deadline: bigint;
  active: boolean;
  isTransactionProposed: boolean;
  isTransactionExecuted: boolean;
  id: bigint;
};

export const DUMMY_CAMPAIGN = {
  title: "Test Campaign",
  description: "Test Description",
  targetAmount: 2,
  // 1 hour from now
  //   deadline: Math.floor(Date.now() / 1000) + 3600,
  // 2 hour
  deadline: Math.floor(Date.now() / 1000) + 3600 * 24 * 10,
};
export const NEGATIVE_DEADLINE = Math.floor(Date.now() / 1000) - 3600;

export function parseUnits(amount: number) {
  return ethers.parseEther(amount.toString());
}

export function parseWei(amount: bigint) {
  return ethers.formatEther(amount);
}

export async function increaseTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []); // Mines a new block to reflect the time change
}

export async function getCampaignAndCampaignId(eduFund: EduFund) {
  const campaign = await eduFund.createCampaign(
    DUMMY_CAMPAIGN.title,
    DUMMY_CAMPAIGN.description,
    parseUnits(DUMMY_CAMPAIGN.targetAmount),
    DUMMY_CAMPAIGN.deadline
  );
  const tx = await campaign.wait(1);
  const campaignId = (tx?.logs[0] as any).args[1];

  return {
    campaign,
    campaignId,
  };
}

export async function donateCampaign(
  eduFund: EduFund,
  signers: Signers,
  campaignId: number,
  numDonors = 17,
  goal = DUMMY_CAMPAIGN.targetAmount
) {
  const amountToDonate = goal / numDonors;
  const usedGas: bigint[] = [];
  for (let i = 1; i <= numDonors; i++) {
    const tx = await eduFund
      .connect(signers[i])
      .donate(campaignId, { value: parseUnits(amountToDonate) });
    const receipt = await tx.wait();
    usedGas.push(receipt?.gasUsed ?? 0n);
  }
  return usedGas;
}

export async function voteCampaign(
  eduFund: EduFund,
  signers: Signers,
  campaignId: number,
  numDonors = 17,
  vote = 1
) {
  const usedGas: bigint[] = [];
  for (let i = 1; i <= numDonors; i++) {
    const tx = await eduFund.connect(signers[i]).vote(campaignId, vote);
    const receipt = await tx.wait();
    usedGas.push(receipt?.gasUsed ?? 0n);
  }
  return usedGas;
}

export async function proposeTransaction(
  eduFund: EduFund,
  signers: Signers,
  campaignId: number
) {
  await eduFund.proposeTransactions(
    campaignId,
    [signers[18].address, signers[19].address],
    [parseUnits(1), parseUnits(0.9)],
    ["For anime manga", "For anime manga"]
  );
}

export async function getDonatorsBalance(n: number, showLog: boolean = false) {
  const signers = await ethers.getSigners();

  const balance = [];
  for (let i = 1; i <= n; i++) {
    balance.push(await ethers.provider.getBalance(signers[i].address));
  }
  const parsedBalance: string[] = [];
  balance.forEach((b) => parsedBalance.push(parseWei(b)));
  showLog && console.log(parsedBalance);
  return balance;
}
export async function getRecipientBalance(showLog: boolean = false) {
  const signers = await ethers.getSigners();
  const [r1, r2] = await Promise.all([
    await ethers.provider.getBalance(signers[18]),
    await ethers.provider.getBalance(signers[19]),
  ]);

  showLog && console.log(parseWei(r1), parseWei(r2));
  return [r1, r2];
}
