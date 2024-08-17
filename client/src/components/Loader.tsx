"use client";

import useLoader from "@/hooks/useLoader";
import { cn } from "@/lib/utils";

const Loader = () => {
  const { loading, label } = useLoader();
  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-[100] w-screen transition-all duration-300 backdrop-blur-md h-screen bg-black bg-opacity-50 flex justify-center items-center",
        {
          "opacity-0 pointer-events-none hidden": !loading,
          "opacity-100 pointer-events-auto": loading,
        }
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primaryPurple"></div>
        {/* label */}
        {label && (
          <p className="font-epilogue font-semibold text-white text-[18px] mt-6">
            {label}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;
