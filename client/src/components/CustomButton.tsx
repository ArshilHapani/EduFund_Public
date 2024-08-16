import React from "react";

import { cn } from "@/lib/utils";

interface CustomButtonProps {
  btnType: "button" | "submit" | "reset";
  title: string;
  styles: string;
  handleClick?: () => void;
}

const CustomButton = ({
  btnType,
  title,
  styles,
  handleClick,
}: CustomButtonProps) => {
  return (
    <button
      type={btnType}
      className={cn(
        "font-epilogue cursor-pointer font-semibold bg-primaryPurple text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px]",
        styles
      )}
      onClick={handleClick ? handleClick : () => {}}
    >
      {title}
    </button>
  );
};

export default CustomButton;
