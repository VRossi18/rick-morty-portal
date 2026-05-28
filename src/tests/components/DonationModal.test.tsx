import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { DonationModal } from '../../components/donations/DonationModal';

vi.mock('../../components/donations/CryptoDonationPanel', () => ({
   CryptoDonationPanel: () => <div data-testid="crypto-panel">crypto</div>,
}));

vi.mock('../../config/donations', async (importOriginal) => {
   const actual = await importOriginal<typeof import('../../config/donations')>();
   return {
      ...actual,
      isStripePixConfigured: true,
   };
});

describe('DonationModal', () => {
   it('renders disclaimer and tabs when open', async () => {
      render(<DonationModal open onClose={() => {}} />);

      expect(screen.getByText(i18n.t('donations.disclaimerTitle'))).toBeInTheDocument();
      expect(screen.getByText(i18n.t('donations.disclaimerBody'))).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: i18n.t('donations.tabCrypto') })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: i18n.t('donations.tabFiat') })).toBeInTheDocument();
      await waitFor(() => {
         expect(screen.getByTestId('crypto-panel')).toBeInTheDocument();
      });
   });

   it('shows fiat PIX panel when fiat tab is selected', () => {
      render(<DonationModal open onClose={() => {}} />);

      fireEvent.click(screen.getByRole('tab', { name: i18n.t('donations.tabFiat') }));

      expect(screen.getByText(i18n.t('donations.fiat.amountLabel'))).toBeInTheDocument();
      expect(screen.getByRole('button', { name: i18n.t('donations.fiat.pixButton') })).toBeEnabled();
   });

   it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<DonationModal open onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: i18n.t('donations.close') }));

      expect(onClose).toHaveBeenCalled();
   });
});
