"use client";

import useCustomContract from "@/hooks/useContract";
import { useSigner } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";

const MyDonation = () => {
  const [donations, setDonations] = useState([]);
  const eduFund = useCustomContract();
  const signer = useSigner();
  useEffect(() => {
    (async function () {
      if (!eduFund || !signer) return;
      const donations = await eduFund.getAllDonations();
      setDonations(donations);
    })();
  }, [eduFund, signer]);
  return (
    <div>
      <h1>My Donation</h1>
      <pre>{JSON.stringify(donations, null, 2)}</pre>
    </div>
  );
};

export default MyDonation;
