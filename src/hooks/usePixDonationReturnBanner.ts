import { useEffect, useMemo } from 'react';

export type PixDonationReturnBanner = 'success' | 'cancelled' | null;

function readPixReturnBannerFromUrl(): PixDonationReturnBanner {
   const params = new URLSearchParams(window.location.search);
   const donation = params.get('donation');

   if (donation === 'pix-success') {
      return 'success';
   }

   if (donation === 'pix-cancelled') {
      return 'cancelled';
   }

   return null;
}

export function usePixDonationReturnBanner(open: boolean): PixDonationReturnBanner {
   const banner = useMemo(() => {
      if (!open) {
         return null;
      }
      return readPixReturnBannerFromUrl();
   }, [open]);

   useEffect(() => {
      if (!open || !banner) {
         return;
      }

      const params = new URLSearchParams(window.location.search);
      if (!params.has('donation')) {
         return;
      }

      params.delete('donation');
      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
   }, [open, banner]);

   return banner;
}
