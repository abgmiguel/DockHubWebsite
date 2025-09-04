/** @type {import('tailwindcss').Config} */
const semanticPlugin = require("../../shared/tailwind-semantic-plugin")

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/darkflows.com/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors for black/dark theme with red accent
        'primary': '#DC2626',         // red-600 - main brand color
        'secondary': '#EA580C',       // orange-600
        'accent': '#FACC15',          // yellow-400
        'background': '#000000',      // black - page background
        'surface': '#111827',         // gray-900 - card backgrounds
        'surface-hover': '#1F2937',   // gray-800 - hover state
        'border': '#1F2937',          // gray-800 - borders
        
        // Text colors
        'text-primary': '#F3F4F6',    // gray-100 - main text
        'text-secondary': '#D1D5DB',  // gray-300 - secondary text
        'text-muted': '#6B7280',      // gray-500 - muted text
        'text-inverse': '#000000',    // black - text on light backgrounds
        
        // Interactive elements
        'link': '#F87171',            // red-400
        'link-hover': '#FCA5A5',      // red-300
        
        // Status colors (consistent across all sites)
        'success': '#10B981',         // green-500
        'warning': '#F59E0B',         // yellow-500
        'error': '#EF4444',           // red-500
        'info': '#3B82F6',            // blue-500
        
        // DarkFlows specific
        'dark-red': '#7f1d1d',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fire': 'fire 3s ease-in-out infinite',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.5)',
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
  ],
}