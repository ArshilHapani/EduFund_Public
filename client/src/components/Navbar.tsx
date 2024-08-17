import Image from "next/image";
import React from "react";
import { SearchIcon } from "lucide-react";

import ConnectButton from "./ConnectButton";

const Navbar = () => {
  return (
    <nav className="flex justify-between mb-[35px] md:items-center items-end flex-col-reverse md:flex-row gap-y-4 md:gap-y-0">
      <div className=" flex flex-row md:w-[458px] w-full py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px]">
        <input
          type="text"
          placeholder="Search for campaigns"
          className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
        />
        <button className="w-[72px] h-full rounded-[20px] bg-primaryPurple flex justify-center items-center cursor-pointer">
          <SearchIcon />
        </button>
      </div>
      <div className="flex justify-between w-full md:w-fit md:block">
        <Image
          src="/EduFund-Logo-Transparent.png"
          alt="EduFund"
          width={60}
          height={60}
          className="pointer-events-none block md:hidden"
        />
        <ConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;
