"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { DOCK_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import TooltipComponent from "./TooltipComponent";

const Dock = () => {
  const pathName = usePathname();
  return (
    <div className="fixed dark z-10 left-1/2 bottom-8 transform -translate-x-1/2 flex justify-center items-center">
      <div className="hidden md:flex bg-dockBlack/50 backdrop-blur-lg gap-4 px-4 py-3 rounded-3xl  justify-evenly">
        {DOCK_ITEMS.map((item, idx) => (
          <TooltipComponent title={item.title} key={item.title + idx}>
            <Link
              className={cn(
                "w-[48px] h-[48px] rounded-[10px] flex justify-center items-center hover:text-primaryPurple hover:bg-dockIconHover transition-all",
                {
                  "text-primaryPurple bg-dockIconHover": pathName === item.href,
                }
              )}
              href={item.href}
            >
              <item.icon className="h-1/2 w-1/2 opacity-80" />
            </Link>
          </TooltipComponent>
        ))}
      </div>
    </div>
  );
};

export default Dock;
