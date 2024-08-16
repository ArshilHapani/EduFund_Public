/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSigner } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import Link from "next/link";

import useCustomContract from "@/hooks/useContract";
import { Campaign } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
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
import { transformDataToCampaign } from "@/lib/utils";
import { VoterType } from "../campaigns-to-vote/[id]/page";
import { Badge } from "@/components/ui/badge";

type TransactionSucceed = {
  [key: string]: boolean;
};

const FinalizedTransaction = () => {
  const signer = useSigner();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCampaignSucceed, setIsCampaignSucceed] =
    useState<TransactionSucceed>({});
  const eduFund = useCustomContract();
  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      let campaignsR = transformDataToCampaign(await eduFund.getCampaigns());
      campaignsR = campaignsR.filter((c) => c.isTransactionExecuted);
      setCampaigns(campaignsR);

      let votes: VoterType[][] = [];
      for (let i = 0; i < campaignsR.length; i++) {
        votes.push(
          await eduFund.getVotersByCampaignId(campaignsR[i].id.toString())
        );
      }

      votes.forEach((voters, idx) => {
        let positiveVotes = 0;
        let negativeVotes = 0;
        voters.forEach((voter) => {
          if (voter[1] === 1) positiveVotes++;
          else negativeVotes++;
        });
        let isSucceed = positiveVotes > negativeVotes;
        setIsCampaignSucceed((prev) => ({
          ...prev,
          [campaignsR[idx].id.toString()]: isSucceed,
        }));
      });
    })();
  }, [signer]);

  if (!signer) return <EmptyState title="Connect wallet" />;
  if (campaigns.length === 0)
    return <EmptyState title="No finalized transactions" />;
  return (
    <div>
      <Table className="dark">
        <TableCaption>A list of your campaigns which are voted.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign ID</TableHead>
            <TableHead>Campaign title</TableHead>
            <TableHead>Campaign success</TableHead>
            <TableHead>View campaign</TableHead>
            <TableHead>View proposed transactions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign, idx) => (
            <TableRow key={idx + "DONATION_TABLE"}>
              <TableCell className="font-medium">
                {campaign.id.toString()}
              </TableCell>
              <TableCell>{campaign.title}</TableCell>
              <TableCell>
                {isCampaignSucceed[campaign.id.toString()] ? (
                  <Badge variant="outline">Success</Badge>
                ) : (
                  <Badge variant="destructive">Failed</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button variant="link" size="sm">
                  <Link href={`/campaign/${campaign.id.toString()}`}>View</Link>
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="link" size="sm">
                  <Link
                    href={`/campaigns-to-vote/${campaign.id.toString()}`}
                  >{`View proposals`}</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinalizedTransaction;
