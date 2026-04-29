import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "node:path";

// Multi-page build: one HTML for devtools.html (host page that registers the
// panel) and one HTML for the panel itself. base: './' is required so that
// the generated <script>/<link> tags use relative URLs that work inside the
// chrome-extension:// origin.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "manifest.json", dest: "." }],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        devtools: resolve(__dirname, "src/devtools/devtools.html"),
        panel: resolve(__dirname, "src/panel/panel.html"),
      },
    },
  },
});
