/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useThirdwebConnectedWalletContext } from "@thirdweb-dev/react";
import { BigNumberish } from "ethers";

import useContractV1 from "@/hooks/useContract";
import { Campaign } from "@/lib/types";
import { formatEther, transformDataToCampaign } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { DonationType } from "../my-donations/page";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TOKEN_SYMBOL } from "@/lib/constants";

const CampaignsToVote = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<DonationType>([]);
  const { signer } = useThirdwebConnectedWalletContext();

  const eduFund = useContractV1();

  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      let campaignsR = transformDataToCampaign(await eduFund.getCampaigns());
      let donationsR = (await eduFund.getAllDonations()) as DonationType;

      donationsR = donationsR.filter(
        (donation: [BigNumberish, BigNumberish], idx) =>
          Number(formatEther(donation[1])) > 0 &&
          donation[0].toString() == campaignsR[idx].id.toString() &&
          campaignsR[idx].isTransactionProposed
      );
      campaignsR = campaignsR.filter(
        (c) =>
          Number(c.id.toString()) == Number(donationsR[0][0].toString()) &&
          c.isTransactionProposed
      );
      setCampaigns(campaignsR);
      setDonations(donationsR);
    })();
    // }, [signer, eduFund]); // be careful it leads to memory leak but provides instant updates
  }, [signer]);
  if (!signer) return <EmptyState title="Connect wallet" />;
  if (campaigns.length === 0)
    return (
      <EmptyState
        title="No campaigns"
        subtitle="You have not any campaign to vote."
      />
    );
  return (
    <main className="bg-primaryBlack">
      <Table className="dark">
        <TableCaption>A list of your campaigns to vote.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>View</TableHead>
            <TableHead>Vote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation, idx) => (
            <TableRow key={idx + "DONATION_TABLE"}>
              <TableCell className="font-medium">
                {donation[0].toString()}
              </TableCell>
              <TableCell>
                {formatEther(donation[1].toString())} {TOKEN_SYMBOL}
              </TableCell>
              <TableCell>
                <Button variant="link" size="sm">
                  <Link href={`/campaign/${donation[0].toString()}`}>View</Link>
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  <Link href={`/campaigns-to-vote/${donation[0].toString()}`}>
                    Vote
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
};

export default CampaignsToVote;
