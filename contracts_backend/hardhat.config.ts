import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      chainId: 31337,
      url: "http://localhost:8545",
      accounts: [],
    },
    opencampus: {
      url: `https://rpc.open-campus-codex.gelato.digital/`,
      accounts: [process.env.WALLET_PRIVATE_KEY!],
    },
    arbitrum: {
      url: process.env.ARBITRUM_JSON_RPC_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY!],
    },
  },
};

export default config;
