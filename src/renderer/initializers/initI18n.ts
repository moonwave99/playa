import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../../locales/en.json';

const resources = { en };

export default function initI18n(): void {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en'
    });
}
