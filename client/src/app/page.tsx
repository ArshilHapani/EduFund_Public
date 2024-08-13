"use client";

import { useContract, useChainId } from "@thirdweb-dev/react";
import useContractV1 from "@/hooks/useContract";
import addresses from "@/lib/addresses.json";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { contract, isLoading, error, isError } = useContract(
    addresses.localhost.EduFund,
    "custom"
  );
  const chainId = useChainId();
  const { eduFundClient } = useContractV1();
  console.log(eduFundClient?.getContract());
  return (
    <main className="bg-primaryBlack">
      <h1>arshil</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Contract Address: {contract?.getAddress()}</h2>
          <h2>
            Contract Balance: <br /> <pre>{JSON.stringify(contract?.abi)}</pre>
          </h2>
        </div>
      )}
      {isError && <pre>{JSON.stringify(error)}</pre>}

      <h1>{chainId}</h1>
      <Button
        variant="outline"
        onClick={() =>
          eduFundClient?.createCampaign("Temp", "Temp", 2, Date.now() + 3600)
        }
      >
        Click me
      </Button>
    </main>
  );
}
