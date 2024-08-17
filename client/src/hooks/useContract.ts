import {
  useChainId,
  useThirdwebConnectedWalletContext,
} from "@thirdweb-dev/react";

import EduFundClient from "@/lib/web3";

function useCustomContract() {
  const { signer } = useThirdwebConnectedWalletContext();
  const chainId = useChainId();

  const eduFundCLient = new EduFundClient(
    signer,
    chainId ?? 31337 /* Default to hardhat localhost */
  );
  return eduFundCLient;
}

export default useCustomContract;
