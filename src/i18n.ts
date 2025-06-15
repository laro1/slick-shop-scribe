
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './lib/i18n/locales/en.json';
import es from './lib/i18n/locales/es.json';

export const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
} as const;

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18next;
