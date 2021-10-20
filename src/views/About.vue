<template>
  <div class="about">
    <locale-switcher />
    <p>{{ $t("about.welcome") }}</p>
  </div>
</template>

<script lang="ts">
import LocaleSwitcher from "@/components/LocaleSwitcher.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    "locale-switcher": LocaleSwitcher,
  },
});
</script>

