"use client";

import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DOCK_ITEMS } from "@/lib/constants";
import { useState } from "react";

export default function MobileDrawer() {
  const [open, setOpen] = useState(false);
  function handleClose() {
    setOpen(false);
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="dark"
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="h-8 w-8" />
      </Button>
      <SheetContent className="dark" side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="bg-gray-700 h-[1px] w-full my-4" />
        <div className="grid gap-4 py-4">
          {DOCK_ITEMS.map((item, idx) => (
            <Button
              variant="link"
              key={item.title + idx}
              className="block"
              type="submit"
              onClick={handleClose}
            >
              <Link
                href={item.href}
                className="flex items-center justify-start"
              >
                <item.icon className="h-5 w-5 mr-4" />
                <span>{item.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
