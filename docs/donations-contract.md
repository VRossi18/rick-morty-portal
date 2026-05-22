# Donation contract (Polygon)

Reference Solidity for the frontend `donate()` payable call. Deploy separately; the SPA only needs the deployed address in `.env`.

## Expected interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RickMortyDonations {
    address public owner;
    event Donated(address indexed sender, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable {
        require(msg.value > 0, "amount required");
        emit Donated(msg.sender, msg.value);
    }

    receive() external payable {
        emit Donated(msg.sender, msg.value);
    }
}
```

The ABI used in the app is in [`src/abis/donationContract.ts`](../src/abis/donationContract.ts).

## Deploy

1. Deploy to **Polygon Mainnet** (chain id `137`).
2. Copy the contract address into `.env`:

```env
VITE_DONATION_CONTRACT_ADDRESS=0xYourDeployedAddress
```

3. Optional: custom RPC

```env
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
```

## Frontend

- Network: Polygon only (`wagmi` + `viem`).
- Wallet: injected (MetaMask, Brave, etc.).
- Flow: connect → switch chain if needed → `donate()` with `value` in MATIC.
