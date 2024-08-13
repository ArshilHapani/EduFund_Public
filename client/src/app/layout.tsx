import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ContextProvider from "@/components/Provider";

import "./globals.css";
import Navbar from "@/components/Navbar";

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
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider>
          <Navbar />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
