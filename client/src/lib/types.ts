import { BigNumberish } from "ethers";

type BigNumberAr = {
  type: "BigNumber";
  hex: string;
};

export type CampaignType = [
  string,
  string,
  string,
  BigNumberAr,
  BigNumberAr,
  BigNumberAr,
  boolean,
  boolean,
  boolean,
  BigNumberAr
];
export interface Campaign {
  owner: string;
  title: string;
  description: string;
  goal: BigNumberish;
  balance: BigNumberish;
  deadline: BigNumberish;
  active: boolean;
  isTransactionProposed: boolean;
  isTransactionExecuted: boolean;
  id: BigNumberish;
}
