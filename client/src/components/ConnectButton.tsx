"use client";

import { ConnectWallet } from "@thirdweb-dev/react";

import { cn } from "@/lib/utils";

const ConnectButton = ({ className }: { className?: string }) => {
  return (
    <ConnectWallet
      className={cn(className)}
      btnTitle="Connect"
      hideReceiveButton
      hideSendButton
      hideBuyButton
      modalTitle="EDU Fund"
      modalTitleIconUrl="https://cdn.dorahacks.io/static/files/19117df21919e8a13dc35244a98b0c67.png"
      welcomeScreen={{
        title: "EDU Fund",
        subtitle: "The place where you rise",
      }}
      auth={{ loginOptional: true }}
      theme="dark"
      showThirdwebBranding={false}
      style={{
        // make it little bit transparent
        // backgroundColor: "#8c6dfd",
        // color: "#fff",
        borderRadius: "20px",
        padding: "10px 20px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    />
  );
};

export default ConnectButton;
