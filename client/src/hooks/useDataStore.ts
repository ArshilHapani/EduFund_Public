import { create } from "zustand";

import { Campaign } from "@/lib/types";

interface DataStore {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  donatedCampaignsIds: string[];
  setDonatedCampaignsIds: (campaigns: string[]) => void;
}

const useDataStore = create<DataStore>((set) => ({
  campaigns: [],
  donatedCampaignsIds: [],
  setCampaigns(campaigns) {
    set({ campaigns });
  },
  setDonatedCampaignsIds(donatedCampaignsIds) {
    set({ donatedCampaignsIds });
  },
}));

export default useDataStore;
