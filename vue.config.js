module.exports = {
  productionSourceMap: process.env.NODE_ENV != "production",
  pwa: {
    manifestPath: "site.webmanifest",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js",
    },
  },
};
