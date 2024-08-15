"use client";

import { useFieldArray, useForm } from "react-hook-form";

import { Minus, Plus, Trash2 } from "lucide-react";
import useModal from "@/hooks/useModal";
import { Campaign } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import TextField from "../TextField";
import { useToast } from "../ui/use-toast";
import useLoader from "@/hooks/useLoader";
import useCustomContract from "@/hooks/useContract";

type Props = {
  campaign: Campaign;
};

type ProposeTransactionDetails = {
  amount: string;
  address: string;
  description: string;
};
type FormSchema = {
  details: ProposeTransactionDetails[];
};

const ProposeTransaction = ({ campaign }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    defaultValues: {
      details: [{ amount: "", address: "", description: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "details",
    control,
  });
  const { toast } = useToast();
  const { isOpen, type, closeModal } = useModal();
  const { setLoading } = useLoader();
  const eduChain = useCustomContract();
  const modalOpen = isOpen && type === `propose-transaction-${campaign.id}`;
  async function onSubmit(data: FormSchema) {
    if (data.details.length === 0) {
      toast({
        title: "Error",
        description: "At least one transaction is required",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      await eduChain.proposeTransaction(
        campaign.id,
        data.details.map((d) => d.address),
        data.details.map((d) => d.amount),
        data.details.map((d) => d.description)
      );
      toast({
        title: "Success",
        description: "Transaction proposed",
      });
      reset();
      closeModal();
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
    <Dialog open={modalOpen} onOpenChange={closeModal}>
      <DialogContent className="px-6 dark overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Propose transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-y-auto overflow-x-hidden  max-h-[600px] my-10">
            {fields.map((field, index) => (
              <div key={field.id}>
                <TextField
                  register={register}
                  label="Address"
                  // @ts-ignore
                  name={`details.${index}.address`}
                  error={errors.details?.[index]?.address}
                  required
                  isAddress
                  isInvalid={!!errors.details?.[index]?.address}
                  className="mb-4"
                  errorMessage="Address is required"
                  placeholder="0x"
                  type="text"
                />
                <TextField
                  register={register}
                  label="Amount"
                  // @ts-ignore
                  name={`details.${index}.amount`}
                  error={errors.details?.[index]?.amount}
                  required
                  isInvalid={!!errors.details?.[index]?.amount}
                  className="mb-4"
                  errorMessage="Amount is required"
                  placeholder="0.0"
                  type="number"
                />
                <TextField
                  register={register}
                  label="Description"
                  // @ts-ignore
                  name={`details.${index}.description`}
                  error={errors.details?.[index]?.description}
                  required
                  isInvalid={!!errors.details?.[index]?.description}
                  className="mb-4"
                  errorMessage="Description is required"
                  placeholder="Description (markdown supported)"
                  type="text"
                  isTextArea
                />
                <div className="mb-8" />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              className="rounded-full"
              size="icon"
              variant="outline"
              type="button"
              onClick={() => remove(fields.length - 1)}
            >
              <Minus className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={() =>
                append({ amount: "", address: "", description: "" })
              }
            >
              <Plus className="h-6 w-6" />
            </Button>
            <Button variant="outline" type="submit">
              Propose
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposeTransaction;
