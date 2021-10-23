<template>
  <div id="nav">
    <router-link :to="buildToLink('Home')">
      {{ $t("menu.home") }}
    </router-link>
    <router-link :to="buildToLink('About')">
      {{ $t("menu.about") }}
    </router-link>
  </div>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { i18nHelper } from "./plugins/I18NHelper";

export default defineComponent({
  data() {
    return {
      currentLocale: i18nHelper.currentLocale,
    };
  },
  methods: {
    buildToLink(routeName: string, options = {}) {
      const toObj = {
        name: routeName,
        params: {
          locale: this.$store.state.lang,
        },
      };
      return Object.assign({}, toObj, options);
    },
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
