/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  useAddress,
  useThirdwebConnectedWalletContext,
} from "@thirdweb-dev/react";
import { SyntheticEvent, useEffect, useMemo, useState } from "react";

import CounterBox from "@/components/CounterBox";
import CustomButton from "@/components/CustomButton";
import RenderMD from "@/components/RenderMD";
import { useToast } from "@/components/ui/use-toast";
import useCustomContract from "@/hooks/useContract";
import useLoader from "@/hooks/useLoader";
import { Campaign } from "@/lib/types";
import {
  calculateBarPercentage,
  calculateRemainingDays,
  formatEther,
  getRandomAvatar,
  getRandomImageFromUnsplash,
} from "@/lib/utils";
import { TOKEN_SYMBOL } from "@/lib/constants";

type Props = {
  params: {
    id: string;
  };
};

const CampaignDetail = ({ params: { id } }: Props) => {
  const [campaign, setCampaign] = useState<Campaign>({
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
  const [randomImageUrl, setRandomImageUrl] = useState({
    imageUrl: "",
    avatarUrl: "",
  });
  const eduFund = useCustomContract();
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState<string[][]>([]);
  const { setLoading } = useLoader();
  const { signer } = useThirdwebConnectedWalletContext();
  const { toast } = useToast();
  const address = useAddress();
  const renderDonationSectionCondition = useMemo(
    () =>
      campaign.owner !== address &&
      campaign.balance.toString() !== campaign.goal.toString() &&
      !donators.some(([a]) => a == address),
    [campaign, donators, address]
  );
  useEffect(() => {
    (async function () {
      if (!id || !signer) return;
      const campaign = await eduFund.getCampaignById(id);
      const donators = await eduFund.getDonationsByCampaignId(id);

      setDonators(donators);
      setCampaign(campaign);
    })();
  }, [signer, eduFund]);

  useEffect(() => {
    (async function () {
      const randomImage = await getRandomImageFromUnsplash();
      setRandomImageUrl({
        imageUrl: randomImage,
        avatarUrl: getRandomAvatar(),
      });
    })();
  }, []);
  async function handleDonation(e: SyntheticEvent) {
    e.preventDefault();
    if (amount === "") {
      toast({
        title: "Amount cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true, "Donating...");
      await eduFund.donate(id, Number(amount));
      toast({
        title: "Donation successful",
        description: "Thank you for your donation. Changes will reflect soon",
      });
    } catch (e: any) {
      toast({
        title: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img
            src={randomImageUrl.imageUrl}
            alt="campaign"
            className="w-full h-[410px] object-cover rounded-xl"
          />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#4acd8d]"
              style={{
                width: `${calculateBarPercentage(
                  Number(campaign.goal.toString()),
                  Number(campaign.balance.toString())
                )}%`,
                maxWidth: "100%",
              }}
            ></div>
          </div>
        </div>
        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CounterBox
            title="Days"
            value={calculateRemainingDays(campaign.deadline.toString())}
          />
          <CounterBox
            title={`Raise of ${formatEther(campaign.goal.toString())}`}
            value={formatEther(campaign.balance.toString())}
          />
          <CounterBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex flex-col lg:flex-row gap-5 ">
        <div className="flex-[2] flex flex-col gap-[40px] ">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white  uppercase">
              Creator
            </h4>
            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img
                  src={randomImageUrl.avatarUrl}
                  alt="user"
                  className="w-[60%] h-[60%] object-cover pointer-events-none rounded-full"
                />
              </div>

              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {campaign.owner}
                </h4>
                {/* <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">
                  10 Campaigns
                </p> */}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Story
            </h4>
            <div className="mt-[20px] max-w-[800px] overflow-auto">
              <div>
                <RenderMD
                  className="font-epilogue font-normal text-[16px] leading-[26px] text-justify text-[#808191]"
                  markdown={campaign.description}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Donators
            </h4>
            <div className="mt-[20px] flex flex-col gap-4 ">
              {donators.length > 0 ? (
                donators.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex justify-between items-center gap-4 "
                  >
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-all">
                      {index + 1}. {item[0]}
                    </p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808192] leading-[26px] break-all">
                      {formatEther((item[1] as any).toString())} {TOKEN_SYMBOL}
                    </p>
                  </div>
                ))
              ) : (
                <p className=" font-epilogue font-normal text-[16px] leading-[26px] text-justify text-[#808191]">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
          </div>
        </div>
        {renderDonationSectionCondition && (
          <div className="flex-1">
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Fund
            </h4>
            <form
              onSubmit={handleDonation}
              className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]"
            >
              <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
                Fund the campaign
              </p>
              <div className="mt-[30px]">
                <input
                  type="number"
                  placeholder={`${TOKEN_SYMBOL} 0.1`}
                  step={0.01}
                  className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                  <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                    Back it because you believe in it.
                  </h4>
                  <p className="mt-[22px] font-epilogue font-normal leading-[22px] text-[#808191]">
                    Support the project for no rewards just because it speaks to
                    you
                  </p>
                </div>
                <CustomButton
                  btnType="submit"
                  title="Fund Campaign"
                  styles="w-full bg-[#8c6dfd] cursor-pointer"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;
