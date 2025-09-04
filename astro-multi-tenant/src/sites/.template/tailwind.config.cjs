/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/DOMAIN_PLACEHOLDER/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}',
    './src/layouts/**/*.{astro,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors for dark theme with blue accent
        'primary': '#60A5FA',         // blue-400 - main brand color
        'secondary': '#A78BFA',       // violet-400
        'accent': '#34D399',          // green-400
        
        // Background colors
        'background': '#0F172A',      // slate-900 - page background
        'surface': '#1E293B',         // slate-800 - card backgrounds
        'surface-hover': '#334155',   // slate-700 - hover state
        'muted': '#475569',           // slate-600 - disabled states
        
        // Text colors
        'text-primary': '#F1F5F9',    // slate-100 - main text
        'text-secondary': '#CBD5E1',  // slate-300 - secondary text
        'text-muted': '#94A3B8',      // slate-400 - muted text
        'text-inverse': '#0F172A',    // slate-900 - text on light backgrounds
        
        // Border colors
        'border': '#334155',          // slate-700
        'border-hover': '#475569',    // slate-600
        
        // Interactive elements
        'link': '#60A5FA',            // blue-400
        'link-hover': '#93C5FD',      // blue-300
        
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