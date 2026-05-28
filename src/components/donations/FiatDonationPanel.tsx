import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
   DONATION_PRESET_AMOUNTS_BRL,
   isStripePixConfigured,
} from '../../config/donations';
import type { PixDonationReturnBanner } from '../../hooks/usePixDonationReturnBanner';
import { useStripePixCheckout } from '../../hooks/useStripePixCheckout';

interface FiatDonationPanelProps {
   returnBanner?: PixDonationReturnBanner;
}

export function FiatDonationPanel({ returnBanner = null }: FiatDonationPanelProps) {
   const { t, i18n } = useTranslation('common');
   const { createCheckout, isLoading, errorMessage, setErrorMessage, resetError } =
      useStripePixCheckout();

   const [selectedPreset, setSelectedPreset] = useState<string>(DONATION_PRESET_AMOUNTS_BRL[1]);
   const [customAmount, setCustomAmount] = useState('');

   const amountToSend = useMemo(() => {
      const custom = customAmount.trim();
      if (custom) {
         return custom;
      }
      return selectedPreset;
   }, [customAmount, selectedPreset]);

   const checkoutLocale = useMemo(() => {
      const lang = i18n.language.split('-')[0];
      if (lang === 'en' || lang === 'es' || lang === 'pt') {
         return lang;
      }
      return 'pt';
   }, [i18n.language]);

   const handleDonate = useCallback(async () => {
      resetError();

      try {
         await createCheckout({ amountBrl: amountToSend, locale: checkoutLocale });
      } catch (err) {
         const code = err instanceof Error ? err.message : '';
         if (code === 'STRIPE_NOT_CONFIGURED') {
            setErrorMessage(t('donations.fiat.notConfigured'));
         } else if (code === 'INVALID_AMOUNT') {
            setErrorMessage(t('donations.fiat.invalidAmount'));
         } else {
            setErrorMessage(t('donations.fiat.errorGeneric'));
         }
      }
   }, [amountToSend, checkoutLocale, createCheckout, resetError, setErrorMessage, t]);

   if (!isStripePixConfigured) {
      return (
         <p className="text-sm text-muted-foreground">{t('donations.fiat.notConfigured')}</p>
      );
   }

   return (
      <div className="space-y-4">
         <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t('donations.fiat.network')}
         </p>

         {returnBanner === 'success' ? (
            <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground">
               {t('donations.fiat.success')}
            </p>
         ) : null}

         {returnBanner === 'cancelled' ? (
            <p className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
               {t('donations.fiat.cancelled')}
            </p>
         ) : null}

         <p className="text-xs leading-relaxed text-muted-foreground">{t('donations.fiat.iofNote')}</p>

         <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
               {t('donations.fiat.amountLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
               {DONATION_PRESET_AMOUNTS_BRL.map((preset) => (
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
                     R$ {preset}
                  </button>
               ))}
            </div>
            <input
               type="text"
               inputMode="decimal"
               value={customAmount}
               onChange={(e) => setCustomAmount(e.target.value)}
               placeholder={t('donations.fiat.customPlaceholder')}
               className="w-full rounded-lg border border-primary/40 bg-[var(--bg-color)] px-3 py-2 text-sm"
            />
         </div>

         <button
            type="button"
            onClick={() => void handleDonate()}
            disabled={isLoading}
            className="w-full rounded-lg border border-primary/60 bg-primary/15 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/25 disabled:opacity-50"
         >
            {isLoading ? t('donations.fiat.pending') : t('donations.fiat.pixButton')}
         </button>

         {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
      </div>
   );
}
