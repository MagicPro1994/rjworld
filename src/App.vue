<template>
  <Header />
  <main>
    <Modal v-if="showModal">
      <template v-slot:header>
        <span class="font-semibold"> {{ $t("app.new_version.header") }}</span>
      </template>
      <template v-slot:body>
        <span v-html="$t('app.new_version.message')"> </span>
      </template>
      <template v-slot:footer>
        <button
          class="modal__button modal__button--uncommon"
          @click="showModal = false"
        >
          {{ $t("modal.cancel") }}
        </button>
        <button
          class="modal__button modal__button--recommend"
          @click="refreshApp()"
        >
          {{ $t("modal.update") }}
        </button>
      </template>
    </Modal>
    <router-view />
  </main>
  <Footer />
</template>

<script lang="ts">
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import Modal from "@/components/common/Modal.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    Header,
    Footer,
    Modal,
  },
  data() {
    return {
      refreshing: false,
      registration: null as null | ServiceWorkerRegistration,
      updateExists: false,
      showModal: false,
    };
  },
  created() {
    document.addEventListener("swUpdated", this.showRefreshUI, { once: true });
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.refreshing) return;
        this.refreshing = true;
        window.location.reload();
      });
    }
  },
  methods: {
    showRefreshUI(e: Event) {
      this.registration = (e as CustomEvent<ServiceWorkerRegistration>).detail;
      this.updateExists = true;
    },
    refreshApp() {
      this.updateExists = false;
      this.showModal = false;
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      this.registration.waiting.postMessage({
        type: "SKIP_WAITING",
      });
    },
  },
});
</script>

<style lang="scss" src="@/assets/styles/main.scss" />
