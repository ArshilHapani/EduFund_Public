/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSigner } from "@thirdweb-dev/react";
import { BigNumberish } from "ethers";
import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/EmptyState";
import useCustomContract from "@/hooks/useContract";
import { formatEther } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TOKEN_SYMBOL } from "@/lib/constants";
import useDataStore from "@/hooks/useDataStore";

export type DonationType = [BigNumberish, BigNumberish][];

const MyDonation = () => {
  const [donations, setDonations] = useState<DonationType>([]);
  const eduFund = useCustomContract();
  const signer = useSigner();
  const { setDonatedCampaigns, donatedCampaigns } = useDataStore();
  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      if (donatedCampaigns.length) {
        setDonations(donatedCampaigns);
        return;
      }
      let donations = (await eduFund.getAllDonations()) as DonationType;
      donations = donations.filter(
        (donation: [BigNumberish, BigNumberish]) =>
          Number(formatEther(donation[1])) > 0
      );
      setDonations(donations);
      setDonatedCampaigns(donations);
    })();
    // }, [signer, eduFund]); // be careful it leads to memory leak but provides instant updates
  }, [signer]);
  if (!signer)
    return (
      <EmptyState
        title="Connect wallet"
        subtitle="To view your all donations you must need to connect wallet"
      />
    );
  if (donations.length === 0)
    return (
      <EmptyState
        title="No donations"
        subtitle="You have not donated any campaign yet."
      />
    );
  return (
    <div>
      <Table className="dark">
        <TableCaption>A list of your donations.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>View</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={1}>Total</TableCell>
            <TableCell>
              {donations
                .reduce((acc, cur) => acc + Number(formatEther(cur[1])), 0)
                .toString()}{" "}
              {TOKEN_SYMBOL}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default MyDonation;
