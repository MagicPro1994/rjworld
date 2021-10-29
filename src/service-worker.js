// eslint-disable-next-line
workbox.core.setCacheNameDetails({ prefix: "rjworld" });

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
// eslint-disable-next-line
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
