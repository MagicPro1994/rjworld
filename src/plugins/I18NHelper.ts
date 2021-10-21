
import axios from "axios";
import { nextTick } from "vue";
import { Composer, I18n, VueI18n } from "vue-i18n";
import { i18n } from "@/i18n";

type I18nDefault = I18n<unknown, unknown, unknown, false | true>;

class I18NHelper {
  private _i18nObj: I18nDefault = i18n;
  private _isLegacy = i18n.mode === "legacy";

  private get i18nObj(): I18nDefault {
    return this._i18nObj;
  }

  public get isLegacy(): boolean {
    return this._isLegacy;
  }

  get defaultLocale(): string {
    return process.env.VUE_APP_I18N_LOCALE;
  }

  get supportedLocales(): [string] {
    return process.env.VUE_APP_I18N_SUPPORTED_LOCALE_LIST.split(",");
  }

  private get currentLocale(): string {
    if (this.isLegacy) {
      return (this.i18nObj.global as VueI18n).locale;
    }
    return (this.i18nObj.global as Composer).locale.value;
  }

  private set currentLocale(locale: string) {
    if (this.isLegacy) {
      (this.i18nObj.global as VueI18n).locale = locale;
    } else {
      (this.i18nObj.global as Composer).locale.value = locale;
    }
  }

  constructor() {
    if (!(this instanceof I18NHelper)) {
      return new I18NHelper();
    }
  }

  private setI18nLanguage(locale: string) {
    this.currentLocale = locale;
    // Specify the language setting for headers
    axios.defaults.headers.common["Accept-Language"] = locale;
    document.querySelector("html")?.setAttribute("lang", locale);
  }

  private async loadLocaleMessages(locale: string) {
    // load locale messages with dynamic import
    const messages = await import(`@/locales/${locale}.json`);
    // set locale message
    this.i18nObj.global.setLocaleMessage(locale, messages.default);
    return nextTick();
  }

  private isLocaleMessagesReady(locale: string): boolean {
    return this.i18nObj.global.availableLocales.includes(locale);
  }

  public isLocaleSupported(locale: string): boolean {
    return this.supportedLocales.includes(locale);
  }

  public async changeLocale(locale: string) {
    if (!this.isLocaleSupported(locale)) {
      throw new Error(`${locale} is not supported`);
    }
    if (!this.isLocaleMessagesReady(locale)) {
      await this.loadLocaleMessages(locale);
    }
    this.setI18nLanguage(locale);
  }

  public injectI18NParam(to: Location): Location {
    return Object.assign({ params: { locale: this.currentLocale } }, to);
  }

  public get userPreferredLocale(): string {
    const userLocale = window.navigator.language || this.defaultLocale;
    const userLocaleShort = userLocale.split("-")[0];
    // Try to use the language code
    if (this.isLocaleSupported(userLocale)) {
      return userLocale;
    }
    // Try to use first part of the language code
    if (this.isLocaleSupported(userLocaleShort)) {
      return userLocaleShort;
    }
    // If user preferred locale is not supported, change to default locale
    return this.defaultLocale;
  }
}

export const i18nHelper = new I18NHelper();
