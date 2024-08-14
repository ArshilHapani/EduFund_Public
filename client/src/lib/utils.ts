import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";
import { createAvatar } from "@dicebear/core";

import { Campaign } from "./types";
import { AVATARS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformDataToCampaign(rawData: any[][]): Campaign[] {
  const ans = [];
  for (const data of rawData) {
    ans.push({
      owner: data[0] as string,
      title: data[1] as string,
      description: data[2] as string,
      goal: data[3],
      balance: data[4],
      deadline: data[5],
      active: data[6] as boolean,
      isTransactionProposed: data[7] as boolean,
      isTransactionExecuted: data[8] as boolean,
      id: data[9],
    });
  }
  return ans;
}

export function formatEther(balance: any): string {
  return ethers.utils.formatEther(balance);
}

export function calculateRemainingDays(deadline: string): number {
  // calculate remaining days from string timestamp
  const deadlineTimestamp = parseInt(deadline);
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingTime = deadlineTimestamp - currentTime;
  return Math.floor(remainingTime / (3600 * 24));
}

export function getRandomAvatar() {
  const randomIndex = Math.floor(Math.random() * AVATARS.length);
  //@ts-ignore
  return createAvatar(AVATARS[randomIndex], {
    size: 128,
    // ... other options
  }).toDataUri();
}
