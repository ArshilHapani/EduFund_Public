"use client";

import useContract from "@/hooks/useContract";
import { useThirdwebConnectedWalletContext } from "@thirdweb-dev/react";
import { useEffect } from "react";

const ConnectContract = () => {
  const { signer } = useThirdwebConnectedWalletContext();
  const { setContract, eduFundClient } = useContract();
  useEffect(() => {
    if (!signer || !eduFundClient) {
      setContract(signer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

export default ConnectContract;
