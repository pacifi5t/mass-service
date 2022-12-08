import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import sveltePreprocess from 'svelte-preprocess';
import makeAttractionsImporter from 'attractions/importer';

export default defineConfig(({ command, mode }) => {
  return {
    base: './',
    plugins: [
      svelte({
        preprocess: sveltePreprocess({
          scss: {
            importer: makeAttractionsImporter({
              themeFile: resolve('./src/theme.scss')
            })
          }
        })
      })
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer()
        ]
      }
    }
  };
});
