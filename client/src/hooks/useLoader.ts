import { create } from "zustand";

interface LoaderState {
  loading: boolean;
  setLoading: (loading: boolean, label?: string) => void;
  label?: string;
}

const useLoader = create<LoaderState>((set) => ({
  loading: false,
  label: "Loading...",
  setLoading: (loading, label) => set({ loading, label }),
}));

export default useLoader;
