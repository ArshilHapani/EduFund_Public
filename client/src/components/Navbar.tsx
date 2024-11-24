"use client";

import { SearchIcon } from "lucide-react";
import { type SyntheticEvent } from "react";
import Image from "next/image";

import ConnectButton from "./ConnectButton";
import MobileDrawer from "./Drawer";
import { useToast } from "./ui/use-toast";

const Navbar = () => {
  const { toast } = useToast();
  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    toast({
      title: "Search",
      description: "Search feature is not available yet",
    });
  }
  return (
    <nav className="flex justify-between mb-[35px] md:items-center items-end flex-col-reverse md:flex-row gap-y-4 md:gap-y-0">
      <div className="flex items-center gap-x-4 md:gap-x-0 md:w-[458px] w-full">
        <Image
          src="/EduFund-Logo-Transparent.png"
          alt="EduFund Logo"
          width={100}
          height={100}
        />
        <form
          onSubmit={handleSubmit}
          className=" flex flex-row md:w-[458px] w-full py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px]"
        >
          <input
            type="text"
            placeholder="Search for campaigns"
            className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
          />
          <button className="w-[72px] h-full rounded-[20px] bg-primaryPurple flex justify-center items-center cursor-pointer">
            <SearchIcon />
          </button>
        </form>
      </div>
      <div className="flex justify-between w-full md:w-fit md:block">
        <div className="block md:hidden">
          <MobileDrawer />
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;
