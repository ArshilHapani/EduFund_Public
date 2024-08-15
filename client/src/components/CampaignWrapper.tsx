"use client";

import { Campaign } from "@/lib/types";
import CampaignCard from "./CampaignCard";

type Props = {
  title: string;
  campaigns: Campaign[];
};

const CampaignWrapper = ({ campaigns, title }: Props) => {
  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left ">
        {title} ({campaigns.length})
      </h1>
      <div className="flex flex-wrap mt-[20px] gap-[26px] ">
        {campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campaign yet.
          </p>
        )}

        {campaigns.length > 0 &&
          campaigns.map((campaign, index) => (
            <CampaignCard
              key={campaign.id.toString() + index + campaign.description}
              campaign={campaign}
            />
          ))}
      </div>
    </div>
  );
};

export default CampaignWrapper;
