import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnection, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import {
   DONATION_CHAIN_ID,
   DONATION_PRESET_AMOUNTS_MATIC,
   getPolygonExplorerTxUrl,
   isDonationContractConfigured,
} from '../../config/donations';
import { useDonationContract } from '../../hooks/useDonationContract';

export function CryptoDonationPanel() {
   const { t } = useTranslation('common');
   const { address, isConnected, chainId } = useConnection();
   const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect();
   const { disconnect } = useDisconnect();
   const { switchChain, isPending: isSwitching } = useSwitchChain();
   const { donate, isPending, isConfirming, isConfirmed, hash, error, reset } =
      useDonationContract();

   const [selectedPreset, setSelectedPreset] = useState<string>(
      DONATION_PRESET_AMOUNTS_MATIC[1],
   );
   const [customAmount, setCustomAmount] = useState('');
   const [localError, setLocalError] = useState<string | null>(null);

   const isWrongNetwork = isConnected && chainId !== DONATION_CHAIN_ID;

   const amountToSend = useMemo(() => {
      const custom = customAmount.trim();
      if (custom) {
         return custom;
      }
      return selectedPreset;
   }, [customAmount, selectedPreset]);

   const injectedConnector = connectors[0];

   const handleConnect = useCallback(() => {
      if (!injectedConnector) {
         return;
      }
      connect({ connector: injectedConnector, chainId: DONATION_CHAIN_ID });
   }, [connect, injectedConnector]);

   const handleDonate = useCallback(async () => {
      setLocalError(null);
      reset();

      const parsed = Number(amountToSend);
      if (!Number.isFinite(parsed) || parsed <= 0) {
         setLocalError(t('donations.crypto.invalidAmount'));
         return;
      }

      try {
         await donate(amountToSend);
      } catch (err) {
         const message = err instanceof Error ? err.message : '';
         if (message.includes('CONTRACT_NOT_CONFIGURED')) {
            setLocalError(t('donations.crypto.contractNotConfigured'));
         } else {
            setLocalError(t('donations.crypto.errorGeneric'));
         }
      }
   }, [amountToSend, donate, reset, t]);

   if (!isDonationContractConfigured) {
      return (
         <p className="text-sm text-muted-foreground">
            {t('donations.crypto.contractNotConfigured')}
         </p>
      );
   }

   return (
      <div className="space-y-4">
         <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t('donations.crypto.network')}
         </p>

         {!isConnected ? (
            <div className="space-y-3">
               <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting || !injectedConnector}
                  className="w-full rounded-lg border border-primary/60 bg-primary/15 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/25 disabled:opacity-50"
               >
                  {isConnecting
                     ? t('donations.crypto.connecting')
                     : t('donations.crypto.connectWallet')}
               </button>
               {connectError ? (
                  <p className="text-sm text-red-500">{t('donations.crypto.errorGeneric')}</p>
               ) : null}
            </div>
         ) : (
            <div className="space-y-4">
               <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-card/40 px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                     {address?.slice(0, 6)}…{address?.slice(-4)}
                  </span>
                  <button
                     type="button"
                     onClick={() => disconnect()}
                     className="text-xs font-semibold text-primary hover:underline"
                  >
                     {t('donations.crypto.disconnect')}
                  </button>
               </div>

               {isWrongNetwork ? (
                  <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3">
                     <p className="text-sm text-foreground">{t('donations.crypto.wrongNetwork')}</p>
                     <button
                        type="button"
                        onClick={() => switchChain({ chainId: DONATION_CHAIN_ID })}
                        disabled={isSwitching}
                        className="rounded-lg border border-primary/50 px-3 py-1.5 text-sm font-semibold text-primary"
                     >
                        {isSwitching
                           ? t('donations.crypto.switching')
                           : t('donations.crypto.switchNetwork')}
                     </button>
                  </div>
               ) : (
                  <>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                           {t('donations.crypto.amountLabel')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                           {DONATION_PRESET_AMOUNTS_MATIC.map((preset) => (
                              <button
                                 key={preset}
                                 type="button"
                                 onClick={() => {
                                    setSelectedPreset(preset);
                                    setCustomAmount('');
                                 }}
                                 className={clsx(
                                    'rounded-lg border px-3 py-1.5 text-sm font-semibold transition',
                                    selectedPreset === preset && !customAmount.trim()
                                       ? 'border-primary bg-primary/15 text-primary'
                                       : 'border-border text-muted-foreground hover:border-primary/40',
                                 )}
                              >
                                 {preset} MATIC
                              </button>
                           ))}
                        </div>
                        <input
                           type="text"
                           inputMode="decimal"
                           value={customAmount}
                           onChange={(e) => setCustomAmount(e.target.value)}
                           placeholder={t('donations.crypto.customPlaceholder')}
                           className="w-full rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm"
                        />
                     </div>

                     <button
                        type="button"
                        onClick={() => void handleDonate()}
                        disabled={isPending || isConfirming}
                        className="w-full rounded-lg border border-primary/60 bg-primary/15 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/25 disabled:opacity-50"
                     >
                        {isPending || isConfirming
                           ? t('donations.crypto.pending')
                           : t('donations.crypto.donate')}
                     </button>

                     {localError || error ? (
                        <p className="text-sm text-red-500">
                           {localError ?? t('donations.crypto.errorGeneric')}
                        </p>
                     ) : null}

                     {isConfirmed && hash ? (
                        <p className="text-sm text-foreground">
                           {t('donations.crypto.success')}{' '}
                           <a
                              href={getPolygonExplorerTxUrl(hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-primary underline-offset-2 hover:underline"
                           >
                              {t('donations.crypto.explorerLink')}
                           </a>
                        </p>
                     ) : null}
                  </>
               )}
            </div>
         )}
      </div>
   );
}
