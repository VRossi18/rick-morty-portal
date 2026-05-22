import { useTranslation } from 'react-i18next';

export function FiatDonationPanel() {
   const { t } = useTranslation('common');

   return (
      <div className="space-y-4">
         <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-muted-foreground">
            {t('donations.fiat.comingSoon')}
         </p>
         <p className="text-sm text-muted-foreground">{t('donations.fiat.pixNote')}</p>
         <p className="text-sm text-muted-foreground">{t('donations.fiat.stripeNote')}</p>
         <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-semibold text-muted-foreground opacity-60"
         >
            {t('donations.fiat.pixButton')}
         </button>
      </div>
   );
}
