<p align="center">
  <img src="./assets/banner.png" alt="EDUFund Contracts Backend" style="border-radius: 10px;">
</p>

# EDUFund Contracts Backend

It uses hardhat as the contract development framework.

It contains majorly three contract files:

- `contracts/EDUFund.sol`: The main contract file.
- `contracts/Errors.sol`: The error codes for the contract.
- `contracts/Events.sol`: The events for the contract.

## Some other important files to note

- `scripts/deploy.js`: The deployment script.
- `scripts/restoreState.ts`: This script is used after deployment of the contract using previous file (deploy.js). It is used for following task:
  - Create campaigns
  - Donate the campaigns
  - Propose transactions
  - Voting campaigns
  - After running this script you can view the campaigns which are ready to finalize on the frontend.

## Setup

1. Clone the repository.

```bash
git clone https://github.com/ArshilHapani/EduFund_Public
```

2. Install the dependencies

```bash
cd contracts_backend &&
npm install
```

3. Create a `.env` file in the root directory and add the following:

```bash
cp .env.example .env
```

Add the required environment variables in the `.env` file.

4. Run the tests

```bash
npx hardhat test
```

5. Start the hardhat node

```bash
npx hardhat node
```

6. Deploy the contract (on another terminal)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

That's it! You are ready to go. 🚀
