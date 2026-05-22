import { useCallback, useMemo } from 'react';
import {
   useConnect,
   useConnection,
   useConnectors,
   useDisconnect,
   useSwitchChain,
} from 'wagmi';
import { DONATION_CHAIN_ID } from '../config/donations';

export function useDonationWallet() {
   const { address, isConnected, chainId } = useConnection();
   const connectors = useConnectors();
   const {
      mutate: connectWallet,
      isPending: isConnecting,
      error: connectError,
   } = useConnect();
   const { mutate: disconnectWallet } = useDisconnect();
   const { mutate: switchToDonationChain, isPending: isSwitching } = useSwitchChain();

   const injectedConnector = useMemo(
      () => connectors.find((c) => c.id === 'injected') ?? connectors[0],
      [connectors],
   );

   const isWrongNetwork = isConnected && chainId !== DONATION_CHAIN_ID;

   const shortAddress = useMemo(() => {
      if (!address) {
         return null;
      }
      return `${address.slice(0, 6)}…${address.slice(-4)}`;
   }, [address]);

   const connectInjected = useCallback(() => {
      if (!injectedConnector) {
         return;
      }
      connectWallet({ connector: injectedConnector, chainId: DONATION_CHAIN_ID });
   }, [connectWallet, injectedConnector]);

   const disconnect = useCallback(() => {
      disconnectWallet();
   }, [disconnectWallet]);

   const switchToPolygon = useCallback(() => {
      switchToDonationChain({ chainId: DONATION_CHAIN_ID });
   }, [switchToDonationChain]);

   return {
      address,
      shortAddress,
      isConnected,
      isWrongNetwork,
      canConnect: Boolean(injectedConnector),
      isConnecting,
      connectError,
      connectInjected,
      disconnect,
      isSwitching,
      switchToPolygon,
   };
}
