// i18n configuration for Excel to Winfakt
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Updated to add Turkish language support
import enTranslation from './locales/en.json';
import nlTranslation from './locales/nl.json';
import frTranslation from './locales/fr.json';
import trTranslation from './locales/tr.json';

// Get stored language from localStorage or default to browser language
const storedLanguage = localStorage.getItem('i18nextLng');

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      nl: {
        translation: nlTranslation
      },
      fr: {
        translation: frTranslation
      },
      tr: {
        translation: trTranslation
      }
    },
    lng: storedLanguage || 'nl', // Use stored language if available, default to Dutch
    fallbackLng: 'nl', // Set Dutch as fallback language
    debug: false,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false // Prevents issues with suspense during language changes
    }
  });

// Create a function to change language that can be imported anywhere
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
  document.documentElement.lang = lng;
};

export default i18n;
