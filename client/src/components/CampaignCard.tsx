/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";

import { Campaign } from "@/lib/types";
import {
  calculateRemainingDays,
  cn,
  formatEther,
  getRandomAvatar,
  getRandomImageFromUnsplash,
} from "@/lib/utils";
import Link from "next/link";
import { Button } from "./ui/button";
import { CheckIcon } from "lucide-react";
import TooltipComponent from "./TooltipComponent";
import ProposeTransaction from "./modals/ProposeTransaction";
import useModal from "@/hooks/useModal";

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
  useEffect(() => {
    (async function () {
      const image = await getRandomImageFromUnsplash();
      setRandomImageUrl(image);
    })();
  }, []);

  const isCampaignReadyToProposeTransaction =
    balance >= goal && !isTransactionProposed && !isTransactionExecuted;
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
                Raised of {formatEther(goal)} ETH
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
          <TooltipComponent title="Finalize transaction">
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
      <ProposeTransaction campaign={campaign} />
    </div>
  );
};

export default CampaignCard;
