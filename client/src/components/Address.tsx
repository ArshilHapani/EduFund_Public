"use client";

import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  address: string;
  className?: string;
};

const Address = ({ address, className }: Props) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 4000);
  };
  return (
    <div className="flex items-center gap-2">
      <p className={cn("text-white text-[16px]", className)}>{address}</p>
      <button className="text-white cursor-pointer " onClick={handleCopy}>
        {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

export default Address;
