"use client";

import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Dock from "./Dock";
import HelpButton from "./HelpButton";

const SharedLayout = () => {
  const pathname = usePathname();
  if (pathname === "/home") return null;
  return (
    <div>
      <Navbar />
      <Dock />
      <HelpButton />
    </div>
  );
};

export default SharedLayout;
