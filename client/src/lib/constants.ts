import { Blocks, HandCoins, Radio, User } from "lucide-react";

export const DOCK_ITEMS = [
  {
    title: "All campaigns",
    icon: Blocks,
    href: "/",
  },
  {
    title: "Add campaign",
    icon: Radio,
    href: "/add-campaign",
  },
  {
    title: "My campaigns",
    icon: User,
    href: "/my-campaigns",
  },
  {
    title: "My donations",
    icon: HandCoins,
    href: "/my-donations",
  },
];
