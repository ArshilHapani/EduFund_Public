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

const MyCampaign = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const address = useAddress();
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFund = useContractV1();
  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      const campaigns = await eduFund.getCampaigns();
      setCampaigns(transformDataToCampaign(campaigns));
    })();
  }, [signer, eduFund]);
  if (!signer) return <EmptyState title="Connect wallet" />;
  return (
    <main className="bg-primaryBlack">
      <CampaignWrapper
        title="My Campaigns"
        campaigns={campaigns.filter((campaign) => campaign.owner === address)}
      />
    </main>
  );
};

export default MyCampaign;
