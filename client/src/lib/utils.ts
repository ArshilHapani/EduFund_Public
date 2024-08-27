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

export function formatEther(
  balance: any,
  needNumber: boolean = false
): number | string {
  if (needNumber) {
    return Number(ethers.utils.formatEther(balance));
  }
  return ethers.utils.formatEther(balance);
}

export function calculateRemainingDays(deadline: string): number {
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
    seed: Math.random().toString(),
  }).toDataUri();
}

export async function getRandomImageFromUnsplash() {
  const FALLBACK_IMAGE =
    "https://imgs.search.brave.com/rXr-KhcwB2hKwgiLCrUXJc6GZiHDJTN52rsNX0BKOjw/rs:fit:1200:1200:1/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC9lamw3Y1N1/LmpwZw";
  try {
    if (process.env.NODE_ENV === "development")
      throw new Error("Unsplash API is not working"); // fallback for the time being... (don't want to drain my unsplash credits)
    const queries = [
      "crypto",
      "blockchain",
      "ethereum",
      "decentralized",
      "nature",
      "food",
      "animal",
      "technology",
      "art",
      "music",
      "ai",
      "space",
      "science",
      "education",
    ];

    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    // cache the response for 10 minutes
    if (
      localStorage?.getItem("LastTimeFetchedImage") ||
      Date.now() < Date.now() - 600000
    ) {
      localStorage.removeItem("LastFetchedImage");
    }
    localStorage.setItem("LastTimeFetchedImage", Date.now().toString());
    if (localStorage.getItem("LastFetchedImage")) {
      return localStorage.getItem("LastFetchedImage");
    }
    const response = await fetch(
      // `https://api.unsplash.com/photos/random`, // only when family is not around.. (can't trust unsplash images)
      `https://api.unsplash.com/photos/random?query=${randomQuery}`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return FALLBACK_IMAGE;
    }

    const data = await response.json();
    localStorage.setItem("LastFetchedImage", data.urls.regular);
    return data.urls.regular;
  } catch (error) {
    return FALLBACK_IMAGE;
  }
}

export const calculateBarPercentage = (goal: number, raisedAmount: number) => {
  const percentage = Math.round((raisedAmount * 100) / goal);
  return percentage;
};

export function markdownToText(md: string): string {
  let plainText = md.replace(/[#*>\-`_]/g, "");
  plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  plainText = plainText.replace(/!\[.*\]\([^)]*\)/g, "");
  plainText = plainText.replace(/\*\*(.*?)\*\*/g, "$1");
  plainText = plainText.replace(/\*(.*?)\*/g, "$1");
  plainText = plainText.replace(/`([^`]+)`/g, "$1");
  plainText = plainText.replace(/(\*\*\*|---)/g, "");
  plainText = plainText.replace(/\n{2,}/g, "\n");

  return plainText.trim();
}
