// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

// PostCSS processes each CSS file as its own independent unit, so `@custom-media`
// declared in tokens.css isn't visible when bundle.css is compiled separately.
// postcss-global-data (run before postcss-custom-media) makes tokens.css's
// declarations available everywhere without being re-declared in every file.
// See design-system/README.md#responsive.
//
// Configured twice on purpose: Vite's own CSS pipeline (bundle.css, tokens.css,
// anything imported as a stylesheet) reads vite.css.postcss, while Astro's
// scoped-<style> compiler step reads the root postcss.config.mjs instead and
// ignores this option entirely. Both need the same two plugins.
const tokensPath = fileURLToPath(new URL('./design-system/tokens.css', import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    css: {
      postcss: {
        plugins: [postcssGlobalData({ files: [tokensPath] }), postcssCustomMedia()],
      },
    },
  },
});