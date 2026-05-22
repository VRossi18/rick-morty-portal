import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '../../config/wagmi';
import { DonationModal, type DonationModalProps } from './DonationModal';

const donationQueryClient = new QueryClient({
   defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
   },
});

export function DonationWeb3Root(props: DonationModalProps) {
   return (
      <WagmiProvider config={wagmiConfig}>
         <QueryClientProvider client={donationQueryClient}>
            <DonationModal {...props} />
         </QueryClientProvider>
      </WagmiProvider>
   );
}
