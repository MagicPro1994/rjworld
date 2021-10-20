import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";

export const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: { en },
});
