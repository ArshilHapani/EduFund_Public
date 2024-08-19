import { create } from "zustand";

import { Campaign } from "@/lib/types";
import { DonationType } from "@/app/(app)/my-donations/page";

interface DataStore {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  donatedCampaigns: DonationType;
  setDonatedCampaigns: (campaigns: DonationType) => void;
}

const useDataStore = create<DataStore>((set) => ({
  campaigns: [],
  donatedCampaigns: [],
  setCampaigns(campaigns) {
    set({ campaigns });
  },
  setDonatedCampaigns(donatedCampaigns) {
    set({ donatedCampaigns });
  },
}));

export default useDataStore;
