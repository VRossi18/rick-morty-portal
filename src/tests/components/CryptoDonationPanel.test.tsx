import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { CryptoDonationPanel } from '../../components/donations/CryptoDonationPanel';

const mockUseDonationWallet = vi.fn();
const mockUseDonationContract = vi.fn();

vi.mock('../../hooks/useDonationWallet', () => ({
   useDonationWallet: () => mockUseDonationWallet(),
}));

vi.mock('../../hooks/useDonationContract', () => ({
   useDonationContract: () => mockUseDonationContract(),
}));

vi.mock('../../config/donations', async (importOriginal) => {
   const actual = await importOriginal<typeof import('../../config/donations')>();
   return {
      ...actual,
      isDonationContractConfigured: false,
      donationContractAddress: null,
   };
});

describe('CryptoDonationPanel', () => {
   beforeEach(() => {
      mockUseDonationWallet.mockReturnValue({
         shortAddress: null,
         isConnected: false,
         isWrongNetwork: false,
         canConnect: true,
         isConnecting: false,
         connectError: null,
         connectInjected: vi.fn(),
         disconnect: vi.fn(),
         isSwitching: false,
         switchToPolygon: vi.fn(),
      });
      mockUseDonationContract.mockReturnValue({
         donate: vi.fn(),
         isPending: false,
         isConfirming: false,
         isConfirmed: false,
         hash: undefined,
         error: null,
         reset: vi.fn(),
      });
   });

   it('shows contract not configured message', () => {
      render(<CryptoDonationPanel />);

      expect(
         screen.getByText(i18n.t('donations.crypto.contractNotConfigured')),
      ).toBeInTheDocument();
   });
});
