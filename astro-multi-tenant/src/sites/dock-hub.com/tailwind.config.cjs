/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/dock-hub.com/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}',
    './src/layouts/**/*.{astro,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // DockHub brand colors
        'primary': '#00ff88',         // Bright green - main brand color
        'secondary': '#00a8e8',       // Blue for secondary actions
        'accent': '#00ff88',          // Same as primary for consistency
        
        // Background colors (dark theme)
        'background': '#1a1a1a',      // Main dark background
        'surface': '#2a2a2a',         // Card/section backgrounds
        'surface-hover': '#3a3a3a',   // Hover state
        'muted': '#4a4a4a',           // Disabled states
        
        // Text colors
        'text-primary': '#ffffff',    // White - main text
        'text-secondary': '#cccccc',  // Light gray - secondary text
        'text-muted': '#999999',      // Gray - muted text
        'text-inverse': '#1a1a1a',    // Dark text on light backgrounds
        'text-accent': '#00ff88',     // Green text for highlights
        
        // Border colors
        'border': '#3a3a3a',          // Dark gray border
        'border-hover': '#4a4a4a',    // Hover border
        'border-accent': '#00ff88',   // Green accent border
        
        // Interactive elements
        'link': '#00ff88',            // Green links
        'link-hover': '#00cc6a',      // Darker green on hover
        
        // Status colors
        'success': '#00ff88',         // Green for success
        'warning': '#ffd700',         // Gold for warnings/highlights
        'error': '#ff4444',           // Red for errors
        'info': '#00a8e8',            // Blue for info
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
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'stagger-in': 'fadeInUp 0.6s ease-out',
        'float': 'float 20s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}