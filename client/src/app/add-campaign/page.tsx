"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import CustomButton from "@/components/CustomButton";
import TextField from "@/components/TextField";
import { useToast } from "@/components/ui/use-toast";

import useCustomContract from "@/hooks/useContract";
import useLoader from "@/hooks/useLoader";

interface FormSchema {
  title: string;
  description: string;
  goal: number;
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
  const router = useRouter();

  function onSubmit({ deadline, description, goal, title }: FormSchema) {
    setLoading(true, "Creating campaign...");
    const deadlineTimestamp = new Date(deadline).getTime() / 1000;
    eduFundClient
      .createCampaign(title, description, goal, deadlineTimestamp)
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
            label="Goal (in EDU token)"
            placeholder="100 EDU"
            type="number"
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
