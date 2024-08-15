import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ContextProvider from "@/components/Provider";
import Navbar from "@/components/Navbar";
import Dock from "@/components/Dock";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Loader from "@/components/Loader";

import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduFund",
  description:
    "EduFund envisions a community where people come together, fund, and innovate the future of education hand in hand with blockchain and WEB3 technologies. This decentralized crowdfunding platform, built on the EDU chain, aims to revolutionize the way educational initiatives are funded and developed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-primaryBlack text-white font-epilogue sm:p-8 p-4 container mb-20",
          inter.className
        )}
      >
        <ContextProvider>
          <ThemeProvider defaultTheme="dark">
            <Navbar />
            <Dock />
            {children}
            <Toaster />
            <Loader />
          </ThemeProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
