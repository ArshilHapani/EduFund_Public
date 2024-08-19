/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useThirdwebConnectedWalletContext } from "@thirdweb-dev/react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

import useContractV1 from "@/hooks/useContract";
import useModal from "@/hooks/useModal";
import { Campaign } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";
import { cn, formatEther, transformDataToCampaign } from "@/lib/utils";
import {
  ProposalTransactionType,
  VoterType,
} from "../campaigns-to-vote/[id]/page";
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
import { Badge } from "@/components/ui/badge";
import TooltipComponent from "@/components/TooltipComponent";
import { Button } from "@/components/ui/button";
import FinalizeTransaction from "@/components/modals/FinalizeTransaction";

type DS = { [key: string]: { positiveVotes: number; negativeVotes: number } };

const VotedCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [votes, setVotes] = useState<DS>({});
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFund = useContractV1();
  const [recipients, setRecipients] = useState<
    { recipient: string; amount: string }[]
  >([]);
  const { openModal } = useModal();

  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      let campaignsR = transformDataToCampaign(
        await eduFund.getTransactionReadyCampaigns()
      );
      campaignsR = campaignsR.filter((c) => c.title !== "");
      setCampaigns(campaignsR);

      let votesAr: VoterType[][] = [];
      for (let i = 0; i < campaignsR.length; i++) {
        votesAr.push(
          await eduFund.getVotersByCampaignId(campaignsR[i].id.toString())
        );
      }
      let counts: DS = {}; // campaignId -> {positiveVotes: number, negativeVotes: number}
      let recipientsAddresses: {
        recipient: string;
        amount: string;
      }[] = [];
      votesAr.forEach(async (voter, idx) => {
        let positiveVotes = 0;
        let negativeVotes = 0;
        voter.forEach((vote) => {
          if (vote[1] === 1) positiveVotes++;
          else negativeVotes++;
        });

        counts[campaignsR[idx].id.toString()] = {
          positiveVotes,
          negativeVotes,
        };

        const proposedTransactions =
          await eduFund.getProposedTransactionsByCampaignId(
            campaignsR[idx].id.toString()
          );
        proposedTransactions.forEach(
          (transaction: ProposalTransactionType[0]) => {
            recipientsAddresses.push({
              recipient: transaction[0],
              amount: formatEther(transaction[1]).toString(),
            });
          }
        );
      });
      setRecipients(recipientsAddresses);
      setVotes(counts);
    })();
  }, [signer]);

  const isWinner = (campaignId: string) =>
    votes[campaignId]?.positiveVotes > votes[campaignId]?.negativeVotes;
  if (!signer) return <EmptyState title="Connect wallet" />;
  if (campaigns.length === 0)
    return (
      <EmptyState
        title="No campaigns for finalization"
        subtitle="You have no campaigns to finalize."
      />
    );
  return (
    <main className="bg-primaryBlack">
      <h1 className="font-epilogue font-semibold mb-[4px] text-[18px] text-white text-left ">
        Campaigns to finalize
      </h1>
      <Table className="dark">
        <TableCaption>A list of your campaigns which are voted.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign ID</TableHead>
            <TableHead>Campaign balance</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Finalize transaction</TableHead>
            <TableHead>View Campaign</TableHead>
            <TableHead>View transaction proposal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign, idx) => (
            <TableRow key={idx + "DONATION_TABLE"}>
              <TableCell className="font-medium">
                {campaign.id.toString()}
              </TableCell>
              <TableCell>
                {formatEther(campaign.balance)} {TOKEN_SYMBOL}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <TooltipComponent title="Positive Votes">
                    <Badge variant="secondary">
                      {votes[campaign.id.toString()]?.positiveVotes}
                    </Badge>
                  </TooltipComponent>
                  <TooltipComponent title="Negative votes">
                    <Badge variant="destructive">
                      {votes[campaign.id.toString()]?.negativeVotes}
                    </Badge>
                  </TooltipComponent>
                </div>
              </TableCell>
              <TableCell>
                <TooltipComponent
                  title={
                    isWinner(campaign.id.toString())
                      ? "Finalize transaction"
                      : "Funds will credited back to the donors account"
                  }
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn("text-primaryGreen rounded-full", {
                      "text-primaryPurple": !isWinner(campaign.id.toString()),
                    })}
                    onClick={() =>
                      openModal(
                        `finalize-transaction-${campaign.id.toString()}`
                      )
                    }
                  >
                    <CheckCircle size={24} />
                  </Button>
                </TooltipComponent>
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
              <FinalizeTransaction
                campaignId={campaign.id.toString()}
                isWinner={isWinner(campaign.id.toString())}
                recipients={recipients}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
};

export default VotedCampaigns;
