import { useThirdwebConnectedWalletContext } from "@thirdweb-dev/react";

import EduFundClient from "@/lib/web3";

function useCustomContract() {
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFundCLient = new EduFundClient(signer);
  return eduFundCLient;
}

export default useCustomContract;
