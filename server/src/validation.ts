import {
   DONATION_PRESET_CENTS,
   MAX_DONATION_CENTS,
   MIN_DONATION_CENTS,
   isOriginAllowed,
} from './config.js';

export function isValidAmountCents(amountCents: number): boolean {
   if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return false;
   }

   if ((DONATION_PRESET_CENTS as readonly number[]).includes(amountCents)) {
      return true;
   }

   return amountCents >= MIN_DONATION_CENTS && amountCents <= MAX_DONATION_CENTS;
}

export function isAllowedReturnUrl(url: string, allowedOrigins: string[]): boolean {
   try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
         return false;
      }
      return isOriginAllowed(parsed.origin, allowedOrigins);
   } catch {
      return false;
   }
}
