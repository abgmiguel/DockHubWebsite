/** @type {import('tailwindcss').Config} */
const semanticPlugin = require("../../shared/tailwind-semantic-plugin")

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/prestongarrison.com/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{jsx,tsx}',
    './src/layouts/**/*.{astro,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors for light theme
        'primary': '#111827',        // gray-900 - main brand color
        'secondary': '#4B5563',       // gray-600
        'accent': '#6B7280',          // gray-500
        'background': '#FFFFFF',      // white - page background
        'surface': '#FFFFFF',         // white - card backgrounds
        'surface-hover': '#F9FAFB',   // gray-50 - hover state
        'border': '#E5E7EB',          // gray-200 - borders
        
        // Text colors
        'text-primary': '#111827',    // gray-900 - main text
        'text-secondary': '#4B5563',  // gray-600 - secondary text
        'text-muted': '#9CA3AF',      // gray-400 - muted text
        'text-inverse': '#FFFFFF',    // white - text on dark backgrounds
        
        // Interactive elements
        'link': '#374151',            // gray-700
        'link-hover': '#000000',      // black
        
        // Status colors
        'success': '#10B981',         // green-500
        'warning': '#F59E0B',         // yellow-500
        'error': '#EF4444',           // red-500
        'info': '#3B82F6',            // blue-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        poppins: ['Poppins', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      fontSize: {
        'titlept': ['84px', '84px'],
        'smtitlept': ['44px', '44px'],
        '24pt': ['18px', '26px'],
        'budgetpt': ['46px', '42px'],
        'pospt': ['26px', '26px'],
        'botpt': ['30px', '32px'],
        'header_titlept': ['60px', '60px'],
        'header_descpt': ['18px', '20px'],
        'header_smtitlept': ['40px', '40px'],
        'header_smdescpt': ['12px', '14px'],
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
    
    // Skills section colors from JSON
    'bg-blue-600',
    'bg-purple-600',
    'bg-green-500',
    'bg-yellow-400',
    'bg-blue-800',
    'bg-green-400',
    'bg-cyan-300',
    'bg-red-500',
  ],
  plugins: [
    semanticPlugin,  // Semantic utility classes for blog module
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}