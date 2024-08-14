import { cn } from "@/lib/utils";
import React from "react";

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
        styles,
        "font-epilogue font-semibold bg-primaryPurple text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px]"
      )}
      onClick={handleClick}
    >
      {title}
    </button>
  );
};

export default CustomButton;
