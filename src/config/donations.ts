import { polygon } from 'viem/chains';
import type { Address } from 'viem';

export const DONATION_CHAIN = polygon;

export const DONATION_CHAIN_ID = polygon.id;

export const DONATION_PRESET_AMOUNTS_MATIC = ['0.5', '1', '5'] as const;

export const DONATION_PRESET_AMOUNTS_BRL = ['10', '25', '50'] as const;

export const MIN_DONATION_BRL_CENTS = 500;

export const MAX_DONATION_BRL_CENTS = 50000;

export const DONATION_PRESET_BRL_CENTS = [1000, 2500, 5000] as const;

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

const stripeCheckoutApiUrlRaw = import.meta.env.VITE_STRIPE_CHECKOUT_API_URL?.trim() ?? '';

export const stripeCheckoutApiUrl = stripeCheckoutApiUrlRaw;

export const isStripePixConfigured = stripeCheckoutApiUrlRaw.length > 0;

export function resolveStripeCheckoutApiUrl(): string | null {
   if (!stripeCheckoutApiUrlRaw) {
      return null;
   }

   if (/^https?:\/\//i.test(stripeCheckoutApiUrlRaw)) {
      return stripeCheckoutApiUrlRaw;
   }

   if (typeof window !== 'undefined') {
      return new URL(stripeCheckoutApiUrlRaw, window.location.origin).href;
   }

   return stripeCheckoutApiUrlRaw;
}

export function brlToCents(amountBrl: string): number | null {
   const normalized = amountBrl.trim().replace(',', '.');
   const parsed = Number(normalized);
   if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
   }

   const cents = Math.round(parsed * 100);
   if (cents <= 0) {
      return null;
   }

   return cents;
}

export function isValidDonationAmountCents(amountCents: number): boolean {
   if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return false;
   }

   if ((DONATION_PRESET_BRL_CENTS as readonly number[]).includes(amountCents)) {
      return true;
   }

   return amountCents >= MIN_DONATION_BRL_CENTS && amountCents <= MAX_DONATION_BRL_CENTS;
}

export function buildPixReturnUrls(): { successUrl: string; cancelUrl: string } {
   const basePath = import.meta.env.BASE_URL;
   const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
   const returnBase = `${window.location.origin}${normalizedBase}`;
   return {
      successUrl: `${returnBase}?donation=pix-success`,
      cancelUrl: `${returnBase}?donation=pix-cancelled`,
   };
}
