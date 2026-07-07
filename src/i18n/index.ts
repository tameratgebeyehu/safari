import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import am from './am.json';

const resources = {
  en: { translation: en },
  am: { translation: am },
};

export function initI18n(language: string = 'en') {
  if (i18n.isInitialized) return i18n;

  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  return i18n;
}

export default i18n;
