<template>
  <div id="nav">
    <router-link :to="injectI18NParam({ name: 'Home' })">
      {{ $t("menu.home") }}
    </router-link>
    <router-link :to="injectI18NParam({ name: 'About' })">
      {{ $t("menu.about") }}
    </router-link>
  </div>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { i18nHelper } from "./plugins/I18NHelper";

export default defineComponent({
  methods: {
    injectI18NParam(to: Location) {
      return i18nHelper.injectI18NParam(to);
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
