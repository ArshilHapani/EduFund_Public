/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useAddress, useSigner } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import useLoader from "@/hooks/useLoader";
import useCustomContract from "@/hooks/useContract";

import { TOKEN_SYMBOL } from "@/lib/constants";
import { cn, formatEther } from "@/lib/utils";

import Address from "@/components/Address";
import EmptyState from "@/components/EmptyState";
import RenderMD from "@/components/RenderMD";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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

type Props = {
  params: {
    id: string;
  };
};
export type ProposalTransactionType = [string, BigNumber, string][]; // [address, amount, description]
export type VoterType = [string, number]; // [address, hasVoted]

const CampaignVotePage = ({ params: { id } }: Props) => {
  const [campaign, setCampaign] = useState({
    active: false,
    balance: "0",
    deadline: "0",
    description: "",
    goal: "0",
    id: "",
    isTransactionExecuted: false,
    isTransactionProposed: false,
    owner: "",
    title: "",
  });
  const [proposedTransactions, setProposedTransactions] =
    useState<ProposalTransactionType>([]);
  const eduFund = useCustomContract();
  const signer = useSigner();
  const [voters, setVoters] = useState<VoterType[]>([]);
  const { setLoading } = useLoader();
  const { toast } = useToast();
  const address = useAddress();

  useEffect(() => {
    (async function () {
      if (!signer || !id || !eduFund) return;
      const campaign = await eduFund.getCampaignById(id);
      const proposedTransactions =
        await eduFund.getProposedTransactionsByCampaignId(id);
      const voters = await eduFund.getVotersByCampaignId(id);
      setVoters(voters);
      setProposedTransactions(proposedTransactions);
      setCampaign(campaign);
    })();
  }, [signer]);
  const alreadyVoted = voters.some((v) => v[0] === address);
  // const alreadyVoted = useMemo(() => voters.some((v) => v[0] === address), []);
  if (campaign.id == "" || campaign.deadline === "0")
    return <EmptyState title="No campaign found" />;
  if (!signer) return <EmptyState title="Please connect your wallet" />;
  if (proposedTransactions.length === 0)
    return <EmptyState title="No proposed transactions" />;

  async function voteProposal(v: boolean) {
    try {
      setLoading(true);
      await eduFund.voteProposal(id, v);
      toast({
        title: "Success",
        description: "Your vote has been recorded",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <h4 className="font-epilogue font-semibold text-[24px] text-white uppercase">
        {campaign.title}
      </h4>
      <p className="text-[#8d8d8d] text-[18px] font-epilogue tracking-wide uppercase mt-2">
        Campaign transactions proposal{" "}
        <Button size="sm" variant="link" className="dark">
          <Link href={`/campaign/${id}`}>View campaign</Link>{" "}
        </Button>
      </p>
      <div className="space-y-7 mt-8 overflow-auto h-[500px] px-8">
        {proposedTransactions.map((item, index) => (
          <div key={index} className="">
            <h1 className="text-3xl text-neutral-500 mb-3">
              Proposal {index + 1}
            </h1>
            <div className="flex justify-between items-center">
              <Address address={item[0]} />
              <h4 className="text-[#8d8d8d] text-[14px] font-epilogue tracking-wide uppercase">
                Amount: {formatEther(item[1].toString())} {TOKEN_SYMBOL}
              </h4>
            </div>
            <div className="bg-primaryPurple h-[1px] my-3 w-full opacity-60" />
            <div>
              <p className="mt-3 mb-2 text-white opacity-80 text-xl">
                Description:
              </p>
              <RenderMD
                className="font-epilogue font-normal text-[16px] leading-[26px] text-justify text-[#808191]"
                markdown={item[2]}
              />
            </div>
          </div>
        ))}
      </div>

      {/* voting section */}
      <div className="my-10">
        <h4 className="font-epilogue font-semibold text-[24px] text-white uppercase">
          {!alreadyVoted ? "Vote for the proposal" : "Voters"}
        </h4>
        <div>
          {!alreadyVoted ? (
            <div className="flex items-center gap-5 mt-4">
              <Button
                size="lg"
                className="dark bg-green-600 hover:bg-green-700"
                onClick={() => voteProposal(true)}
              >
                Up Vote
              </Button>
              <Button
                size="lg"
                className="dark"
                variant="destructive"
                onClick={() => voteProposal(false)}
              >
                Down Vote
              </Button>
            </div>
          ) : (
            <div>
              <Table className="dark">
                <TableCaption>A list of voters.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr no.</TableHead>
                    <TableHead>Voter</TableHead>
                    <TableHead>Vote</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.map((vote, idx) => (
                    <TableRow key={idx + "DONATION_TABLE"}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell
                        className={cn({
                          "text-white font-bold": vote[0] === address,
                        })}
                      >
                        {vote[0]} {vote[0] === address && "(You)"}
                      </TableCell>
                      <TableCell>
                        {vote[1] === 1 ? (
                          <Badge variant="default">Up Vote</Badge>
                        ) : (
                          <Badge variant="destructive">Down Vote</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignVotePage;
