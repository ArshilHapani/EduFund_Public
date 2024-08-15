import { BigNumberish, Contract, Signer, ethers } from "ethers";

import addresses from "./addresses.json";
import abi from "./abi.json";

export default class EduFundClient {
  private contract: Contract;

  constructor(signer: Signer | undefined) {
    this.contract = new ethers.Contract(
      addresses.localhost.EduFund,
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

  async getCampaignById(id: string) {
    try {
      return await this.contract.s_campaigns(id);
    } catch (e: any) {
      throw new Error(e);
    }
  }
  async getDonationsByCampaignId(id: string) {
    try {
      return await this.contract.getCampaignDonators(id);
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async donate(id: string, amount: number) {
    try {
      await this.contract.donate(id, {
        value: ethers.utils.parseEther(amount.toString()),
      });
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async proposeTransaction(
    campaignId: BigNumberish,
    recipients: string[],
    amounts: string[],
    descriptions: string[]
  ) {
    try {
      await this.contract.proposeTransactions(
        campaignId,
        recipients,
        amounts.map((a) => ethers.utils.parseEther(a.toString())),
        descriptions
      );
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async getAllDonations() {
    try {
      return await this.contract.getDonatorDonationsForAllCampaigns();
    } catch (e: any) {
      throw new Error(e);
    }
  }
}
