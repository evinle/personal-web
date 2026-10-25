import { fileURLToPath } from 'node:url';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

// See astro.config.mjs for why this exists separately from vite.css.postcss,
// and why postcss-global-data is needed. Kept in sync with that file by hand —
// there's no single place both Vite's CSS pipeline and Astro's <style> compiler read.
const tokensPath = fileURLToPath(new URL('./design-system/tokens.css', import.meta.url));

export default {
  plugins: [postcssGlobalData({ files: [tokensPath] }), postcssCustomMedia()],
};
