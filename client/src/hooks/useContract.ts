import EduFundClient from "@/lib/web3";
import { useThirdwebConnectedWalletContext } from "@thirdweb-dev/react";

function useCustomContract() {
  const { signer } = useThirdwebConnectedWalletContext();
  const eduFundCLient = new EduFundClient(signer);
  return eduFundCLient;
}

export default useCustomContract;
