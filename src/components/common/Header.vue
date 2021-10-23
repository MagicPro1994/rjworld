<template>
  <header id="site-header" class="sticky top-0 z-10">
    <nav class="nav">
      <div class="nav__container">
        <div class="nav__logo-container">
          <router-link to="/">
            <img
              src="@/assets/logo.png"
              alt="Red J's World"
              class="w-12 sm:w-14 md:w-14 lg:w-14 xl:w-16"
            />
          </router-link>
        </div>
        <div class="w-3/12 lg:hidden"></div>
        <div class="nav__menu-toggle">
          <button
            title="Menu Toggle"
            class="w-10"
            :aria-expanded="isActive"
            @click="toggleMenu()"
          >
            <img
              alt="List Icon"
              v-if="!isActive"
              class="relative"
              src="@/assets/img/1828859.svg"
            />
            <img
              alt="Close Icon"
              v-if="isActive"
              class="relative"
              src="@/assets/img/61155.svg"
            />
          </button>
        </div>
        <div
          class="nav__route-link-wrapper"
          :aria-expanded="isActive"
          v-bind:class="{ 'nav__route-link-wrapper_inactive': !isActive }"
        >
          <div class="nav__route-link-container">
            <router-link
              :to="buildToLink('Home')"
              class="nav__route-link"
              @click="toggleMenu()"
            >
              {{ $t("menu.home") }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      isActive: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isActive = !this.isActive;
    },
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
