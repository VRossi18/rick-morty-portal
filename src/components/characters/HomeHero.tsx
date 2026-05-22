import { useTranslation } from 'react-i18next';

export function HomeHero() {
   const { t } = useTranslation('common');

   return (
      <header className="px-4 pb-6 pt-8 text-center md:pt-10">
         <h1 className="text-5xl font-black tracking-tighter text-[var(--text-color)] md:text-6xl">
            {t('home.hero.title')}{' '}
            <span className="text-primary">{t('home.hero.titleAccent')}</span>
         </h1>
         <p className="mt-4 font-medium tracking-wide text-slate-500 dark:text-slate-400">
            {t('home.hero.subtitle')}
         </p>
         <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-primary opacity-20" />
      </header>
   );
}
