import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { CryptoDonationPanel } from '../../components/donations/CryptoDonationPanel';

const mockUseConnection = vi.fn();
const mockUseConnect = vi.fn();
const mockUseDisconnect = vi.fn();
const mockUseSwitchChain = vi.fn();
const mockUseDonationContract = vi.fn();

vi.mock('wagmi', () => ({
   useConnection: () => mockUseConnection(),
   useConnect: () => mockUseConnect(),
   useDisconnect: () => mockUseDisconnect(),
   useSwitchChain: () => mockUseSwitchChain(),
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
      mockUseConnection.mockReturnValue({
         address: undefined,
         isConnected: false,
         chainId: undefined,
      });
      mockUseConnect.mockReturnValue({
         connectors: [{ id: 'injected', name: 'Injected' }],
         connect: vi.fn(),
         isPending: false,
         error: null,
      });
      mockUseDisconnect.mockReturnValue({ disconnect: vi.fn() });
      mockUseSwitchChain.mockReturnValue({ switchChain: vi.fn(), isPending: false });
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
