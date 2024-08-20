"use client";

import useModal from "@/hooks/useModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VoterType } from "@/app/(app)/campaigns-to-vote/[id]/page";

type Props = {
  campaignId: string;
  voters: VoterType[];
};

const ViewVotes = ({ campaignId, voters }: Props) => {
  const { isOpen, type, closeModal } = useModal();
  const modalOpen = isOpen && type === `view-votes-${campaignId}`;
  return (
    <Dialog open={modalOpen} onOpenChange={closeModal} modal>
      <DialogContent className="px-6 dark overflow-hidden min-w-fit">
        <DialogHeader>
          <DialogTitle>View Votes</DialogTitle>
        </DialogHeader>
        <Table className="dark max-h-[500px] overflow-auto">
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
                <TableCell>{vote[0]}</TableCell>
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
      </DialogContent>
    </Dialog>
  );
};

export default ViewVotes;
