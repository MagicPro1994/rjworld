<template>
  <div class="home">
    <locale-switcher />
    <p>{{ $t("main.welcome", { username: "Red J" }) }}</p>
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
