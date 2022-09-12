import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import English from "./en";
import Francais from "./fr";
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: English,
    },
    fr: {
      translation: Francais,
    },
  },
  lng: "fr",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
export default useTranslation;
