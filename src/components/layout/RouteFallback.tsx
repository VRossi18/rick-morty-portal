import { useTranslation } from 'react-i18next';

export function RouteFallback() {
   const { t } = useTranslation('common');

   return (
      <div
         className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-4 bg-[var(--bg-color)]"
         role="status"
         aria-live="polite"
         aria-busy="true"
      >
         <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
         <p className="text-sm font-bold text-primary">{t('home.loading')}</p>
      </div>
   );
}
