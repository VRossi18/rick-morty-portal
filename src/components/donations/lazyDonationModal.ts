import { lazy } from 'react';

export function preloadDonationModal() {
   void import('./DonationWeb3Root');
}

export const LazyDonationModal = lazy(() =>
   import('./DonationWeb3Root').then((module) => ({
      default: module.DonationWeb3Root,
   })),
);
