import { polygon } from 'viem/chains';
import type { Address } from 'viem';

export const DONATION_CHAIN = polygon;

export const DONATION_CHAIN_ID = polygon.id;

export const DONATION_PRESET_AMOUNTS_MATIC = ['0.5', '1', '5'] as const;

function parseContractAddress(raw: string | undefined): Address | null {
   const value = raw?.trim();
   if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
      return null;
   }
   return value as Address;
}

export const donationContractAddress = parseContractAddress(
   import.meta.env.VITE_DONATION_CONTRACT_ADDRESS,
);

export const isDonationContractConfigured = donationContractAddress !== null;

export const polygonRpcUrl =
   import.meta.env.VITE_POLYGON_RPC_URL?.trim() || undefined;

export function getPolygonExplorerTxUrl(hash: string): string {
   return `https://polygonscan.com/tx/${hash}`;
}
