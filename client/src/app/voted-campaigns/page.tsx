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

const VotedCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const address = useAddress();
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFund = useContractV1();

  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      let campaigns = transformDataToCampaign(
        await eduFund.getTransactionReadyCampaigns()
      );

      setCampaigns(campaigns);
    })();
  }, [signer]);
  if (!signer) return <EmptyState title="Connect wallet" />;
  return (
    <main className="bg-primaryBlack">
      <CampaignWrapper
        title="Following campaigns are ready for finalization"
        campaigns={campaigns.filter((c) => c.title !== "")}
        subTitle="There are no voted campaigns."
      />
    </main>
  );
};

export default VotedCampaigns;
