/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useThirdwebConnectedWalletContext } from "@thirdweb-dev/react";

import useContractV1 from "@/hooks/useContract";
import useDataStore from "@/hooks/useDataStore";
import { Campaign } from "@/lib/types";
import { formatEther, transformDataToCampaign } from "@/lib/utils";
import CampaignWrapper from "@/components/CampaignWrapper";

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFund = useContractV1();
  const { setCampaigns: setCampaignsStore, campaigns: dataStoreCampaign } =
    useDataStore();
  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      if (dataStoreCampaign.length) {
        setCampaigns(dataStoreCampaign);
        return;
      }
      const campaignsR = transformDataToCampaign(await eduFund.getCampaigns());
      setCampaigns(campaignsR);
      setCampaignsStore(campaignsR);
    })();
    // }, [signer, eduFund]); // be careful it leads to memory leak but provides instant updates
  }, [signer]);

  return (
    <main className="bg-primaryBlack">
      <CampaignWrapper
        title="Active Campaigns"
        campaigns={campaigns.filter(
          (campaign) =>
            campaign.active &&
            formatEther(campaign.balance, true) <
              formatEther(campaign.goal, true)
        )}
        subTitle="You have not created any campaign yet."
      />
    </main>
  );
}
