/** @type {import('tailwindcss').Config} */
const semanticPlugin = require("../../shared/tailwind-semantic-plugin")

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/default/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Default site uses standard Tailwind colors
      // No semantic colors needed since it's just a directory page
    },
  },
  plugins: [
    semanticPlugin,  // Semantic utility classes for blog module
  ],
}