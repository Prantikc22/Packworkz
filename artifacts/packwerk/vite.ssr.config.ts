import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  ssr: {
    noExternal: ["@workspace/api-client-react", "@workspace/api-zod"],
  },
  build: {
    ssr: "src/entry-server.tsx",
    outDir: "dist/server",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "entry-server.js",
        format: "esm",
      },
    },
  },
});
