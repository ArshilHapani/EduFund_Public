import { BigNumber, Contract, Signer, ethers } from "ethers";

import { opencampus, localhost } from "./addresses.json";
import abi from "./abi.json";

export default class EduFundClient {
  private signer: Signer | undefined = undefined;
  private contractAddress: string;
  private contract: Contract;

  constructor(signer: Signer | undefined) {
    this.signer = signer;
    this.contractAddress = localhost.EduFund;
    this.contract = new ethers.Contract(localhost.EduFund, abi.abi, signer);
  }
  getContract(): Contract {
    return this.contract;
  }
  async createCampaign(
    title: string,
    description: string,
    goal: number,
    deadline: number
  ): Promise<void> {
    await this.contract.createCampaign(
      title,
      description,
      ethers.utils.parseEther(goal.toString()),
      BigNumber.from(deadline)
    );
  }
}
