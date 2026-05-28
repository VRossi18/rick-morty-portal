import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { FiatDonationPanel } from '../../components/donations/FiatDonationPanel';

const donationMocks = vi.hoisted(() => ({
   isConfigured: true,
}));

const assignMock = vi.fn();

vi.mock('../../config/donations', async (importOriginal) => {
   const actual = await importOriginal<typeof import('../../config/donations')>();
   return {
      ...actual,
      get isStripePixConfigured() {
         return donationMocks.isConfigured;
      },
      resolveStripeCheckoutApiUrl: () =>
         donationMocks.isConfigured
            ? 'http://localhost:8080/api/stripe/create-checkout-session'
            : null,
   };
});

describe('FiatDonationPanel', () => {
   beforeEach(() => {
      donationMocks.isConfigured = true;
      assignMock.mockReset();
      vi.stubGlobal('fetch', vi.fn());
      Object.defineProperty(window, 'location', {
         configurable: true,
         value: { ...window.location, assign: assignMock, origin: 'http://localhost:5173' },
      });
   });

   it('shows not configured message when Stripe API URL is missing', () => {
      donationMocks.isConfigured = false;

      render(<FiatDonationPanel />);

      expect(screen.getByText(i18n.t('donations.fiat.notConfigured'))).toBeInTheDocument();
   });

   it('redirects to Stripe checkout URL on donate', async () => {
      vi.mocked(fetch).mockResolvedValue({
         ok: true,
         json: async () => ({ url: 'https://checkout.stripe.com/test-session' }),
      } as Response);

      render(<FiatDonationPanel />);

      fireEvent.click(screen.getByRole('button', { name: i18n.t('donations.fiat.pixButton') }));

      await waitFor(() => {
         expect(assignMock).toHaveBeenCalledWith('https://checkout.stripe.com/test-session');
      });
   });

   it('shows success banner when returnBanner is success', () => {
      render(<FiatDonationPanel returnBanner="success" />);

      expect(screen.getByText(i18n.t('donations.fiat.success'))).toBeInTheDocument();
   });
});
