import Image from "next/image";
import React from "react";

import ConnectButton from "./ConnectButton";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between container">
      <a href="/">
        <Image
          src="/EduFund-Logo-Transparent.png"
          alt="Logo"
          height={150}
          width={150}
        />
      </a>
      <div className="flex items-center space-x-4">
        <a href="#about" className="text-lg">
          About
        </a>
        <a href="#Campaigns" className="text-lg">
          Campaigns
        </a>
        <ConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;
