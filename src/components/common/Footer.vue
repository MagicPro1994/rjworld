<template>
  <footer class="footer">
    <div class="container m-0-auto">
      <p class="text-sm mt-2" v-html="$t('app.copyright')"></p>
      <p class="text-sm text-right">
        <a
          href="mailto:theredlion1994@gmail.com"
          target="_blank"
          class="fa-white-teal mr-2"
        >
          <font-awesome-icon icon="envelope" size="lg" />
        </a>
        <a href="https://discord.gg/YeXk4Njz8C" target="_blank">
          <font-awesome-icon
            class="fa-white-teal"
            :icon="['fab', 'discord']"
            size="lg"
          />
        </a>
      </p>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

library.add(faEnvelope, faDiscord);

export default defineComponent({});
</script>
