import { Contract, Signer, ethers } from "ethers";

import addresses from "./addresses.json";
import abi from "./abi.json";

export default class EduFundClient {
  private signer: Signer | undefined = undefined;
  private contractAddress: string;
  private contract: Contract;

  constructor(signer: Signer | undefined) {
    this.signer = signer;
    this.contractAddress = addresses.opencampus.EduFund;
    this.contract = new ethers.Contract(
      addresses.opencampus.EduFund,
      abi.EduFund,
      signer
    );
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
    try {
      await this.contract.createCampaign(
        title,
        description,
        ethers.utils.parseEther(goal.toString()),
        deadline
      );
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async getCampaigns() {
    try {
      return await this.contract.getCampaigns();
    } catch (e: any) {
      throw new Error(e);
    }
  }
}
