import { i18nHelper } from "@/plugins/I18NHelper";
import { createStore } from "vuex";

export default createStore({
  state: {
    lang: "en"
  },
  mutations: {
    changeLanguage(state) {
      state.lang = i18nHelper.currentLocale;
    }
  },
  actions: {},
  modules: {},
})
