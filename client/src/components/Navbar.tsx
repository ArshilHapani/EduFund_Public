import Image from "next/image";
import React from "react";

import ConnectButton from "./ConnectButton";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between container">
      <Image src="/logo.webp" alt="Logo" height={100} width={100} />
      <ConnectButton />
    </nav>
  );
};

export default Navbar;
