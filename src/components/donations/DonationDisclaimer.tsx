import { useTranslation } from 'react-i18next';

export function DonationDisclaimer() {
   const { t } = useTranslation('common');

   return (
      <aside
         className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
         role="note"
      >
         <p className="font-semibold text-foreground">{t('donations.disclaimerTitle')}</p>
         <p className="mt-1 leading-relaxed">{t('donations.disclaimerBody')}</p>
      </aside>
   );
}
