/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import {
  useAddress,
  useThirdwebConnectedWalletContext,
} from "@thirdweb-dev/react";

import useContractV1 from "@/hooks/useContract";
import { Campaign } from "@/lib/types";
import { transformDataToCampaign } from "@/lib/utils";
import CampaignWrapper from "@/components/CampaignWrapper";
import EmptyState from "@/components/EmptyState";
import useDataStore from "@/hooks/useDataStore";

const CampaignsToVote = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFund = useContractV1();
  const address = useAddress();
  const {
    campaigns: dataStoredCampaigns,
    setCampaigns: setDataStoreCampaigns,
  } = useDataStore();

  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      if (dataStoredCampaigns.length) {
        setCampaigns(dataStoredCampaigns);
        return;
      }
      const campaigns = transformDataToCampaign(await eduFund.getCampaigns());
      setDataStoreCampaigns(campaigns);
      setCampaigns(campaigns);
    })();
    // }, [signer, eduFund]); // be careful it leads to memory leak but provides instant updates
  }, [signer]);
  if (!signer) return <EmptyState title="Connect wallet" />;
  return (
    <main className="bg-primaryBlack">
      <CampaignWrapper
        title="My Campaigns"
        campaigns={campaigns}
        subTitle="You have not created any campaign yet."
      />
    </main>
  );
};

export default CampaignsToVote;
