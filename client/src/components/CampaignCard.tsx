/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckIcon, Vote } from "lucide-react";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";

import { type Campaign } from "@/lib/types";
import {
  calculateRemainingDays,
  cn,
  formatEther,
  getRandomAvatar,
  getRandomImageFromUnsplash,
} from "@/lib/utils";
import { TOKEN_SYMBOL } from "@/lib/constants";
import { Button } from "./ui/button";
import TooltipComponent from "./TooltipComponent";
import ProposeTransaction from "./modals/ProposeTransaction";
import ViewVotes from "./modals/ViewVotes";
import { VoterType } from "@/app/campaigns-to-vote/[id]/page";
import useModal from "@/hooks/useModal";
import useCustomContract from "@/hooks/useContract";

type Props = {
  campaign: Campaign;
};

const CampaignCard = ({ campaign }: Props) => {
  const {
    active,
    balance,
    deadline,
    description,
    goal,
    id,
    isTransactionExecuted,
    isTransactionProposed,
    owner,
    title,
  } = campaign;
  const avatar = useMemo(() => getRandomAvatar(), []);
  const [randomImageUrl, setRandomImageUrl] = useState("");
  const { openModal } = useModal();
  const [voters, setVoters] = useState<VoterType[]>([]);
  const pathName = usePathname();
  const eduFund = useCustomContract();
  const signer = useSigner();
  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      const voterR = await eduFund.getVotersByCampaignId(id.toString());
      setVoters(voterR);
    })();
  }, [signer]);
  useEffect(() => {
    (async function () {
      const image = await getRandomImageFromUnsplash();
      setRandomImageUrl(image);
    })();
  }, []);
  const address = useAddress();
  const isCampaignReadyToProposeTransaction =
    owner === address &&
    Number(formatEther(balance)) >= Number(formatEther(goal)) &&
    !isTransactionProposed &&
    !isTransactionExecuted;
  const isCampaignReadyToViewVotes =
    pathName === "/proposed-transaction" &&
    isTransactionProposed &&
    owner === address &&
    !isCampaignReadyToProposeTransaction;
  return (
    <div className="sm:w-[280px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer relative">
      <Link href={`/campaign/${id}`} className="block">
        <img
          src={randomImageUrl}
          alt="fund"
          className="w-full h-[158px] object-cover rounded-[15px]"
        />
        <div className="flex flex-col p-4 ">
          <div className="block">
            <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
              {title}
            </h3>
            <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
              {description}
            </p>
          </div>

          <div className="flex justify-between flex-wrap mt-[15px] gap-2">
            <div className="flex flex-col">
              <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
                {formatEther(balance)}
              </h4>
              <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
                Raised of {formatEther(goal)} {TOKEN_SYMBOL}
              </p>
            </div>
            <div className="flex flex-col">
              <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
                {calculateRemainingDays(deadline.toString())}
              </h4>
              <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
                Days Left
              </p>
            </div>
          </div>
          <hr
            className={cn("mt-[20px] border-[1px] border-[#2d2d3a]", {
              "border-[#2d2d3a]": active,
              "border-[#808191]":
                !active && !isCampaignReadyToProposeTransaction,
              "border-primaryGreen": isCampaignReadyToProposeTransaction,
              "border-primaryPurple": isCampaignReadyToViewVotes,
            })}
          />
          <div className="flex items-center mt-[20px] gap-[12px]">
            <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
              <img
                src={avatar}
                alt="user"
                className="w-1/2 h-1/2 object-cover rounded-full"
              />
            </div>
            <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">
              by{" "}
              <span className="text-[#b2b3bd] ">
                {owner.slice(0, 6)}...{owner.slice(-4)}
              </span>
            </p>
          </div>
        </div>
      </Link>
      {isCampaignReadyToProposeTransaction && (
        <div className="absolute bottom-4 right-4 z-10">
          <TooltipComponent title="Propose transaction">
            <Button
              className="text-primaryGreen rounded-full"
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                openModal(`propose-transaction-${id}`);
              }}
            >
              <CheckIcon className="h-6 w-6" />
            </Button>
          </TooltipComponent>
        </div>
      )}
      {isCampaignReadyToViewVotes && (
        <div className="absolute bottom-4 right-4 z-10">
          <TooltipComponent title="Show votes">
            <Button
              className="text-primaryPurple rounded-full"
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                openModal(`view-votes-${id}`);
              }}
            >
              <Vote className="h-6 w-6" />
            </Button>
          </TooltipComponent>
        </div>
      )}
      <ProposeTransaction campaign={campaign} />
      <ViewVotes voters={voters} campaignId={id.toString()} />
    </div>
  );
};

export default CampaignCard;
