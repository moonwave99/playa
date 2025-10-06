// eslint-disable-next-line import/no-named-as-default
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  initAsync: false,
  debug: true,
  resources: {
    en: {
      translation: en,
    },
  },
  preload: ["en"],
});

export default i18n;
