import { useCallback, useState } from 'react';
import {
   brlToCents,
   buildPixReturnUrls,
   isValidDonationAmountCents,
   resolveStripeCheckoutApiUrl,
} from '../config/donations';

type CheckoutLocale = 'pt' | 'en' | 'es';

interface CreateCheckoutOptions {
   amountBrl: string;
   locale: CheckoutLocale;
}

export function useStripePixCheckout() {
   const [isLoading, setIsLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const resetError = useCallback(() => {
      setErrorMessage(null);
   }, []);

   const createCheckout = useCallback(async ({ amountBrl, locale }: CreateCheckoutOptions) => {
      const apiUrl = resolveStripeCheckoutApiUrl();
      if (!apiUrl) {
         throw new Error('STRIPE_NOT_CONFIGURED');
      }

      const amountCents = brlToCents(amountBrl);
      if (amountCents === null || !isValidDonationAmountCents(amountCents)) {
         throw new Error('INVALID_AMOUNT');
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
         const { successUrl, cancelUrl } = buildPixReturnUrls();
         const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               amountCents,
               successUrl,
               cancelUrl,
               locale,
            }),
         });

         if (!response.ok) {
            throw new Error('CHECKOUT_FAILED');
         }

         const data = (await response.json()) as { url?: string };
         if (!data.url) {
            throw new Error('CHECKOUT_FAILED');
         }

         window.location.assign(data.url);
      } finally {
         setIsLoading(false);
      }
   }, []);

   return {
      createCheckout,
      isLoading,
      errorMessage,
      setErrorMessage,
      resetError,
   };
}
