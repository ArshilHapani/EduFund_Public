import EduFundClient from "@/lib/web3";
import { Contract, Signer } from "ethers";
import { create } from "zustand";

interface ContractState {
  eduFundClient: EduFundClient | null;
  setContract: (signers: Signer | undefined) => void;
}

const useContract = create<ContractState>()((set) => ({
  eduFundClient: null,
  setContract: (signers: Signer | undefined) =>
    set({ eduFundClient: new EduFundClient(signers) }),
}));

export default useContract;
