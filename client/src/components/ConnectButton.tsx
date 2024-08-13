"use client";

import { ConnectWallet } from "@thirdweb-dev/react";

const ConnectButton = () => {
  return (
    <div>
      <ConnectWallet
        btnTitle="Connect"
        hideReceiveButton
        hideSendButton
        hideBuyButton
        modalTitle="EDU Fund"
        modalTitleIconUrl="https://cdn.dorahacks.io/static/files/19117df21919e8a13dc35244a98b0c67.png@256h.webp"
        displayBalanceToken={{ 10: "ETH" }}
        welcomeScreen={{
          title: "EDU Fund",
          subtitle: "The place where you rise",
        }}
        auth={{ loginOptional: true }}
      />
    </div>
  );
};

export default ConnectButton;
