import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import ptCommon from './locales/pt/common.json';

export const LOCALE_STORAGE_KEY = 'portal.locale';

export type PortalLocale = 'pt' | 'en' | 'es';

function readStoredLocale(): PortalLocale {
   if (typeof window === 'undefined') {
      return 'pt';
   }
   const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
   if (v === 'en' || v === 'es') {
      return v;
   }
   return 'pt';
}

function syncDocument(lang: string) {
   if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
   }
   if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, lang);
   }
}

void i18n.use(initReactI18next).init({
   resources: {
      en: { common: enCommon },
      es: { common: esCommon },
      pt: { common: ptCommon },
   },
   lng: readStoredLocale(),
   fallbackLng: 'pt',
   defaultNS: 'common',
   ns: ['common'],
   interpolation: { escapeValue: false },
});

syncDocument(i18n.language);

i18n.on('languageChanged', syncDocument);

export default i18n;
