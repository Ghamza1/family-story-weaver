
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import enTranslation from "./locales/en.json";
import arTNTranslation from "./locales/ar-TN.json";

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      "ar-TN": {
        translation: arTNTranslation
      }
    },
    lng: localStorage.getItem("language") || "en", // Default language
    fallbackLng: "en", // Fallback language
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
