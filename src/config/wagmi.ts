import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { DONATION_CHAIN, polygonRpcUrl } from './donations';

export const wagmiConfig = createConfig({
   chains: [DONATION_CHAIN],
   connectors: [injected()],
   transports: {
      [DONATION_CHAIN.id]: http(polygonRpcUrl),
   },
});
