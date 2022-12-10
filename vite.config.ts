import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import sveltePreprocess from "svelte-preprocess";

export default defineConfig(() => {
  return {
    base: "./",
    plugins: [
      svelte({
        preprocess: sveltePreprocess()
      })
    ],
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()]
      }
    }
  };
});
