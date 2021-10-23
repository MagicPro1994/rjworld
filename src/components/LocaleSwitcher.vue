<template>
  <div class="locale-changer">
    <ul>
      <li v-for="locale in locales" :key="locale" @click="switchLocale(locale)">
        {{ locale }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { i18nHelper } from "@/plugins/I18NHelper";

export default defineComponent({
  methods: {
    switchLocale(locale: string) {
      if (this.$i18n.locale !== locale) {
        i18nHelper.changeLocale(locale);
        console.log(i18nHelper.currentLocale);
        // Rewrite URL after change language
        const to = this.$router.resolve({ params: {locale} });
        this.$router.push(to.href);
      }
    },
  },
  data() {
    return {
      locales: i18nHelper.supportedLocales,
    };
  },
});
</script>
