/**
 * Tailwind CSS Plugin for Semantic Utility Classes
 * 
 * This plugin creates real Tailwind utilities from semantic color names,
 * allowing them to be used with @apply in CSS files.
 * 
 * Each site defines the actual color values in their tailwind.config.cjs
 */

const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities, theme }) {
  // Text color utilities
  const textUtilities = {
    '.text-text-primary': {
      color: theme('colors.text-primary', '#111827'),
    },
    '.text-text-secondary': {
      color: theme('colors.text-secondary', '#4B5563'),
    },
    '.text-text-muted': {
      color: theme('colors.text-muted', '#9CA3AF'),
    },
    '.text-text-inverse': {
      color: theme('colors.text-inverse', '#FFFFFF'),
    },
    '.text-link': {
      color: theme('colors.link', '#2563EB'),
    },
    '.text-link-hover': {
      color: theme('colors.link-hover', '#1D4ED8'),
    },
  }

  // Background color utilities
  const bgUtilities = {
    '.bg-surface': {
      backgroundColor: theme('colors.surface', '#F9FAFB'),
    },
    '.bg-surface-hover': {
      backgroundColor: theme('colors.surface-hover', '#F3F4F6'),
    },
    '.hover\\:bg-surface:hover': {
      backgroundColor: theme('colors.surface', '#F9FAFB'),
    },
    '.hover\\:bg-surface-hover:hover': {
      backgroundColor: theme('colors.surface-hover', '#F3F4F6'),
    },
  }

  // Border color utilities
  const borderUtilities = {
    '.border-border': {
      borderColor: theme('colors.border', '#E5E7EB'),
    },
  }

  // Add all utilities
  addUtilities({
    ...textUtilities,
    ...bgUtilities,
    ...borderUtilities,
  })
})