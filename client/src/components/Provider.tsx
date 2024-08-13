"use client";

import { useEffect, useState } from "react";
import { ThirdwebProvider } from "@thirdweb-dev/react";

import ConnectContract from "./ConnectContract";

type Props = {
  children: React.ReactNode;
};
const ContextProvider = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <ThirdwebProvider
      activeChain="ethereum"
      theme="light"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <ConnectContract />
      {children}
    </ThirdwebProvider>
  );
};

export default ContextProvider;
