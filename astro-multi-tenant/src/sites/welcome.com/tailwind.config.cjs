/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/welcome.com/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors - customize for your brand
        'primary': '#3B82F6',         // blue-500 - main brand color
        'secondary': '#8B5CF6',       // violet-500
        'accent': '#10B981',          // green-500
        
        // Background colors
        'background': '#FFFFFF',      // white - page background
        'surface': '#F9FAFB',         // gray-50 - card backgrounds
        'muted': '#F3F4F6',          // gray-100 - disabled states
        
        // Text colors
        'text-primary': '#111827',   // gray-900 - main text
        'text-secondary': '#6B7280', // gray-500 - secondary text
        'text-muted': '#9CA3AF',     // gray-400 - muted text
        
        // Border colors
        'border': '#E5E7EB',         // gray-200
        'border-hover': '#D1D5DB',   // gray-300
        
        // Status colors
        'success': '#10B981',        // green-500
        'warning': '#F59E0B',        // amber-500
        'error': '#EF4444',          // red-500
        'info': '#3B82F6',           // blue-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}