"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSigner } from "@thirdweb-dev/react";

import CustomButton from "@/components/CustomButton";
import TextField from "@/components/TextField";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/EmptyState";

import useCustomContract from "@/hooks/useContract";
import useLoader from "@/hooks/useLoader";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface FormSchema {
  title: string;
  description: string;
  goal: string;
  deadline: string;
}

const AddCampaign = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    defaultValues: {
      title: "",
      description: "",
      goal: undefined,
      deadline: undefined,
    },
  });
  const { setLoading } = useLoader();
  const eduFundClient = useCustomContract();
  const { toast } = useToast();
  const signer = useSigner();
  const router = useRouter();

  function onSubmit({ deadline, description, goal, title }: FormSchema) {
    if (Number(goal) <= 0 || goal === "") {
      toast({
        title: "Error",
        description: "Goal should be greater than 0",
        variant: "destructive",
      });
      return;
    }
    if (new Date(deadline) < new Date()) {
      toast({
        title: "Error",
        description: "Deadline should be greater than current date",
        variant: "destructive",
      });
      return;
    }
    setLoading(true, "Creating campaign...");
    const deadlineTimestamp = new Date(deadline).getTime() / 1000;
    eduFundClient
      .createCampaign(title, description, Number(goal), deadlineTimestamp)
      .then(() => {
        toast({
          title: "Campaign created",
          description:
            "Your campaign has been created successfully soon it will be visible to everyone after blocks confirmations.",
        });
        router.push("/");
        reset();
      })
      .catch((e: any) => {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }
  if (!signer)
    return (
      <EmptyState
        title="Connect your wallet to create a campaign"
        subtitle="You need to connect your wallet to create a campaign"
      />
    );
  return (
    <div className="bg-[#1c1c24] flex justify-center mb-10 items-center flex-col  rounded-[10px] sm:p-10 p-4">
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Start a campaign
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mt-[65px] flex flex-col gap-[30px]"
      >
        <div className="flex flex-wrap gap-[40px]">
          <TextField<FormSchema>
            label="Campaign title"
            placeholder="Gathering funds for a new project"
            type="text"
            name="title"
            register={register}
            required
            errorMessage="Title is required"
            isInvalid={!!errors.title}
          />
          <TextField<FormSchema>
            label={`Goal (in ${TOKEN_SYMBOL} token)`}
            placeholder={`100 ${TOKEN_SYMBOL}`}
            type="text"
            name="goal"
            register={register}
            required
            errorMessage="Goal is required"
            isInvalid={!!errors.goal}
          />
        </div>
        <TextField<FormSchema>
          label="Description"
          placeholder="Describe your campaign (markdown supported)"
          type="text"
          name="description"
          register={register}
          required
          errorMessage="Description is required"
          isInvalid={!!errors.description}
          isTextArea
          className="resize-none"
        />
        <TextField<FormSchema>
          label="Deadline"
          type="date"
          name="deadline"
          register={register}
          required
          errorMessage="Deadline is required"
          isInvalid={!!errors.deadline}
        />
        <CustomButton
          btnType="submit"
          title="Create campaign"
          styles="w-full"
        />
      </form>
    </div>
  );
};

export default AddCampaign;
