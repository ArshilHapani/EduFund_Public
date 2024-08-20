"use client";

import React from "react";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { useChainId, useSigner } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";

import { Button } from "./ui/button";
import TooltipComponent from "./TooltipComponent";
import { Badge } from "./ui/badge";
import { chainIdToNetwork } from "@/lib/constants";
import { cn } from "@/lib/utils";

const HelpButton = () => {
  const pathname = usePathname();
  const chainId = useChainId();
  const signer = useSigner();
  const isConnected = !!signer;
  if (pathname === "/manual") return null;
  return (
    <>
      <div className="fixed bottom-8 left-4 z-10">
        <TooltipComponent title="Having confusion? here is the manual.">
          <Link href="/manual">
            <Button
              size="icon"
              variant="secondary"
              className="dark rounded-full"
            >
              <CircleHelp className="h-12 w-12" />
            </Button>
          </Link>
        </TooltipComponent>
      </div>
      {/* connected network button */}
      <div className="fixed bottom-8 right-4 z-10">
        <Badge variant="outline" className="py-2 px-4 dark backdrop-blur-lg">
          <span
            className={cn(
              "h-2 w-2 bg-green-500 rounded-full inline-block mr-2",
              {
                "bg-red-500": !isConnected,
              }
            )}
          />
          {isConnected
            ? `connected to ${chainIdToNetwork[chainId ?? 31337]}`
            : "Not connected"}
        </Badge>
      </div>
    </>
  );
};

export default HelpButton;
