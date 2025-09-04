/** @type {import('tailwindcss').Config} */
const semanticPlugin = require("../../shared/tailwind-semantic-plugin")

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/codersinflow.com/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors for dark theme - CodersInFlow theme
        'primary': '#8B5CF6',         // violet-500 - purple primary color
        'secondary': '#A78BFA',       // violet-400
        'accent': '#34D399',          // green-400
        'background': '#0F0B1E',      // very dark purple/navy background
        'surface': '#1A1333',         // dark purple surface
        'surface-hover': '#2A1F4A',   // purple hover state
        'border': '#2A1F4A',          // purple borders
        
        // Text colors
        'text-primary': '#F1F5F9',    // slate-100 - main text
        'text-secondary': '#CBD5E1',  // slate-300 - secondary text
        'text-muted': '#64748B',      // slate-500 - muted text
        'text-inverse': '#0F172A',    // slate-900 - text on light backgrounds
        
        // Interactive elements
        'link': '#60A5FA',            // blue-400
        'link-hover': '#93C5FD',      // blue-300
        
        // Status colors
        'success': '#10B981',         // green-500
        'warning': '#F59E0B',         // yellow-500
        'error': '#EF4444',           // red-500
        'info': '#3B82F6',            // blue-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  safelist: [
    // Background colors
    'bg-background',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    
    // Text colors
    'text-text-inverse',
    
    // Border colors
    'border-primary',
    
    // Hover states
    'hover:bg-primary/90',
  ],
  plugins: [
    semanticPlugin,  // Semantic utility classes for blog module
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}