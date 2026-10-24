import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// `base: "./"` keeps the build portable: Netlify root, a subfolder, or file://.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    target: "es2020",
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      "@js": fileURLToPath(new URL("./src/js", import.meta.url)),
      "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
