"use client";

import useModal from "@/hooks/useModal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import Address from "../Address";
import { ScrollArea } from "../ui/scroll-area";
import useCustomContract from "@/hooks/useContract";
import useLoader from "@/hooks/useLoader";

type Props = {
  campaignId: string;
  isWinner: boolean;
  recipients: { recipient: string; amount: string }[];
};

const FinalizeTransaction = ({ campaignId, isWinner, recipients }: Props) => {
  const { isOpen, type, closeModal } = useModal();
  const eduFund = useCustomContract();
  const modalOpen = isOpen && type === `finalize-transaction-${campaignId}`;
  const { setLoading } = useLoader();
  const { toast } = useToast();
  async function finalizeTransaction() {
    try {
      setLoading(true);
      await eduFund.finalizeTransaction(campaignId);
      toast({
        title: "Transaction finalized",
        description: "Transaction has been finalized successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={modalOpen} onOpenChange={closeModal}>
      <DialogContent className="px-6 dark overflow-hidden min-w-fit">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Finalize transaction
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          {isWinner ? (
            <div>
              <p className="leading-7">
                Are you sure you want to finalize the transaction?
              </p>
              <p className="leading-7 mt-6">
                The funds will be transferred to the following recipients:
              </p>

              <ScrollArea className="h-72 rounded-md border">
                <Table>
                  <TableCaption>Recipients</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipients.map((recipient, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Address address={recipient.recipient} />
                        </TableCell>
                        <TableCell>{recipient.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              On finalizing the transaction all the funds will be refunded to
              the donors.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="destructive" type="submit" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="outline" type="submit" onClick={finalizeTransaction}>
            Finalize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinalizeTransaction;
