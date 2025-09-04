# Adding a New Site to the Multi-Tenant Platform

This guide walks you through adding a new site to the multi-tenant application with proper theming and configuration.

## 🚀 Quick Start (Automated)

The easiest way to add a site:

```bash
./scripts/add-a-site.sh yourdomain.com
```

This script will:
1. Create the site directory structure
2. Generate a Tailwind configuration
3. Create a basic layout and index page
4. Update sites-config.json
5. Generate the initial CSS

## 📝 Manual Setup (Step-by-Step)

### 1. Create Site Directory Structure

```bash
mkdir -p astro-multi-tenant/src/sites/yourdomain.com/{pages,components,styles}
```

### 2. Create Tailwind Configuration

Create `astro-multi-tenant/src/sites/yourdomain.com/tailwind.config.cjs`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/sites/yourdomain.com/**/*.{astro,tsx}',
    './src/modules/blog/**/*.{astro,tsx}',
    './src/shared/components/**/*.{astro,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors - customize these for your brand
        'primary': '#3B82F6',         // Your primary brand color
        'secondary': '#8B5CF6',       // Your secondary color
        'accent': '#10B981',          // Accent color
        
        // Background colors
        'background': '#FFFFFF',      // Main page background
        'surface': '#F9FAFB',         // Card/component backgrounds
        'surface-hover': '#F3F4F6',   // Hover state for surfaces
        'border': '#E5E7EB',          // Border colors
        
        // Text colors
        'text-primary': '#111827',    // Main text color
        'text-secondary': '#4B5563',  // Secondary text
        'text-muted': '#9CA3AF',      // Muted/disabled text
        'text-inverse': '#FFFFFF',    // Text on dark backgrounds
        
        // Interactive elements
        'link': '#2563EB',            // Link color
        'link-hover': '#1D4ED8',      // Link hover color
        
        // Status colors (keep these consistent)
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Add custom fonts here
      },
    },
  },
  // IMPORTANT: Safelist ensures semantic classes are always generated
  safelist: [
    // Background colors
    'bg-background',
    'bg-surface',
    'bg-surface-hover',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    
    // Text colors
    'text-text-primary',
    'text-text-secondary',
    'text-text-muted',
    'text-text-inverse',
    'text-link',
    'text-link-hover',
    
    // Border colors
    'border-border',
    'border-primary',
    
    // Hover states
    'hover:bg-primary/90',
    'hover:bg-surface-hover',
    'hover:text-link-hover',
  ],
  plugins: [
    require('@tailwindcss/typography'),
    // Add other plugins as needed
  ],
}
```

### 3. Create Site Configuration

Create `astro-multi-tenant/src/sites/yourdomain.com/config.json`:

```json
{
  "name": "Your Site Name",
  "description": "Brief description of your site",
  "features": ["blog", "docs"],
  "logo": "/logo.svg",
  "favicon": "/favicon.ico",
  "social": {
    "twitter": "https://twitter.com/yourhandle",
    "github": "https://github.com/yourorg"
  }
}
```

### 4. Create Layout File

Create `astro-multi-tenant/src/sites/yourdomain.com/layout.astro`:

```astro
---
// CRITICAL: Import CSS as raw text to ensure isolation
import siteStyles from './styles/main.css?raw';

export interface Props {
  title?: string;
  description?: string;
}

const { 
  title = 'Your Site Name', 
  description = 'Your site description' 
} = Astro.props;

import config from './config.json';
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Preconnect to external domains if using web fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-background text-text-primary">
    <!-- CRITICAL: Inject CSS inline for isolation -->
    <style set:html={siteStyles}></style>
    
    <!-- Optional: Add site header/navigation here -->
    
    <!-- Page content will be inserted here -->
    <slot />
    
    <!-- Optional: Add site footer here -->
  </body>
</html>

<style is:global>
  /* Additional global styles for this site only */
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: 'Inter', system-ui, sans-serif;
  }
</style>
```

### 5. Create Homepage

Create `astro-multi-tenant/src/sites/yourdomain.com/pages/index.astro`:

```astro
---
import Layout from '../layout.astro';
---

<Layout title="Welcome to Your Site">
  <main class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-5xl font-bold mb-6">
        Welcome to Your Site
      </h1>
      
      <p class="text-xl text-text-secondary mb-8">
        Your tagline or description here.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface p-6 rounded-lg border border-border">
          <h2 class="text-2xl font-semibold mb-3">Feature One</h2>
          <p class="text-text-secondary">
            Description of your first feature.
          </p>
        </div>
        
        <div class="bg-surface p-6 rounded-lg border border-border">
          <h2 class="text-2xl font-semibold mb-3">Feature Two</h2>
          <p class="text-text-secondary">
            Description of your second feature.
          </p>
        </div>
        
        <div class="bg-surface p-6 rounded-lg border border-border">
          <h2 class="text-2xl font-semibold mb-3">Feature Three</h2>
          <p class="text-text-secondary">
            Description of your third feature.
          </p>
        </div>
      </div>
      
      <div class="mt-12">
        <a href="/blog" class="bg-primary text-text-inverse px-6 py-3 rounded-lg inline-block hover:bg-primary/90 transition-colors">
          Visit Blog
        </a>
      </div>
    </div>
  </main>
</Layout>
```

### 6. Update Site Configuration

Add your site to `/sites-config.json` (in the repository root):

```json
{
  // ... existing sites ...
  "yourdomain.com": {
    "id": "yourdomain",
    "directory": "yourdomain.com",
    "database": "yourdomain_db",
    "theme": "light",
    "features": ["blog", "docs"],
    "adminUser": {
      "email": "admin@yourdomain.com",
      "password": "secure_password_here",
      "name": "Admin"
    }
  },
  "www.yourdomain.com": {
    "id": "yourdomain",
    "directory": "yourdomain.com",
    "database": "yourdomain_db",
    "theme": "light",
    "features": ["blog", "docs"]
  }
}
```

### 7. Generate CSS

Run the CSS generation script:

```bash
npm run generate-css
```

This will create `astro-multi-tenant/src/sites/yourdomain.com/styles/main.css` with your site's specific styles.

### 8. Test Your Site

Start the development server:

```bash
npm run dev
```

Access your site at:
- `http://yourdomain.localhost:4321`

## 🎨 Theming Best Practices

### Use Semantic Classes Only

✅ **DO:**
```astro
<div class="bg-primary text-text-inverse">
  <h1 class="text-3xl">Title</h1>
  <p class="text-text-secondary">Description</p>
</div>
```

❌ **DON'T:**
```astro
<div class="bg-blue-500 text-white">
  <h1 class="text-3xl">Title</h1>
  <p class="text-gray-600">Description</p>
</div>
```

### Color Palette Guidelines

#### Light Theme Example:
```javascript
colors: {
  'background': '#FFFFFF',      // White
  'surface': '#F9FAFB',         // Light gray
  'text-primary': '#111827',    // Dark gray
  'text-secondary': '#4B5563',  // Medium gray
  'primary': '#3B82F6',         // Blue
}
```

#### Dark Theme Example:
```javascript
colors: {
  'background': '#111827',      // Dark gray
  'surface': '#1F2937',         // Slightly lighter gray
  'text-primary': '#F3F4F6',    // Light gray
  'text-secondary': '#D1D5DB',  // Medium light gray
  'primary': '#3B82F6',         // Blue
}
```

### CSS Import Pattern

**CRITICAL:** Always follow this exact pattern in your layout:

```astro
---
// ✅ CORRECT: Import as raw text
import siteStyles from './styles/main.css?raw';
---

<body>
  <!-- ✅ CORRECT: Inject inline -->
  <style set:html={siteStyles}></style>
</body>
```

Never do this:
```astro
---
// ❌ WRONG: Regular import causes cross-contamination
import './styles/main.css';
---
```

## 🧩 Using Shared Components

### Import Shared Components

```astro
---
import Button from '../../../shared/components/Button.astro';
import Card from '../../../shared/components/Card.astro';
---

<Button class="bg-primary text-text-inverse">
  Click Me
</Button>

<Card class="bg-surface border-border">
  <h2 class="text-xl text-text-primary">Card Title</h2>
  <p class="text-text-secondary">Card content</p>
</Card>
```

### Create Site-Specific Components

Place in `astro-multi-tenant/src/sites/yourdomain.com/components/`:

```astro
---
// Hero.astro
export interface Props {
  title: string;
  subtitle?: string;
}

const { title, subtitle } = Astro.props;
---

<section class="bg-gradient-to-r from-primary to-secondary py-24">
  <div class="max-w-7xl mx-auto px-4 text-center">
    <h1 class="text-5xl font-bold text-text-inverse mb-4">
      {title}
    </h1>
    {subtitle && (
      <p class="text-xl text-text-inverse/90">
        {subtitle}
      </p>
    )}
  </div>
</section>
```

## 🔄 Module Integration

Your site automatically gets access to all modules (blog, docs, etc.). The modules will use your semantic colors automatically.

### Blog Module Routes
- `/blog` - Blog listing
- `/blog/[slug]` - Individual posts
- `/blog/editor` - Post editor (requires auth)

### Customizing Module Appearance

Add module-specific styles in your layout:

```astro
<style is:global>
  /* Customize blog cards */
  .blog-card {
    @apply bg-surface border-border hover:bg-surface-hover;
  }
  
  /* Customize blog typography */
  .prose {
    @apply text-text-primary;
  }
  
  .prose h1, .prose h2, .prose h3 {
    @apply text-text-primary font-bold;
  }
</style>
```

## 🚨 Common Issues and Solutions

### CSS Not Loading
- **Check:** Did you run `npm run generate-css`?
- **Check:** Is the CSS import using `?raw` suffix?
- **Check:** Is the style tag using `set:html`?

### Wrong Colors Showing
- **Check:** Are multiple CSS files being loaded? (Check DevTools)
- **Check:** Are you using semantic classes, not color-specific ones?
- **Check:** Is your Tailwind config's safelist complete?

### Site Not Appearing
- **Check:** Is the site in `sites-config.json`?
- **Check:** Does the directory name match the config?
- **Check:** Is there a layout.astro file?
- **Check:** Is there an index.astro in pages/?

### Module Not Working
- **Check:** Are you using the correct routes? (`/blog`, not `/blog.astro`)
- **Check:** Is the module enabled in your site's features array?

## 📋 Checklist

Before launching your site, ensure:

- [ ] Tailwind config has all semantic colors defined
- [ ] Safelist includes all semantic classes
- [ ] Layout imports CSS with `?raw` suffix
- [ ] CSS is injected with `<style set:html={styles}></style>`
- [ ] All components use semantic classes only
- [ ] Site is added to sites-config.json
- [ ] CSS has been generated (`npm run generate-css`)
- [ ] Site loads at `yourdomain.localhost:4321`
- [ ] Blog module works at `/blog`
- [ ] Colors appear correctly
- [ ] No CSS contamination from other sites

## 🎯 Next Steps

1. **Add More Pages:** Create additional pages in the `pages/` directory
2. **Customize Components:** Build site-specific components
3. **Configure SEO:** Add meta tags, Open Graph data, etc.
4. **Set Up Analytics:** Add tracking codes to your layout
5. **Deploy:** Build with `npm run build` and deploy

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Astro Documentation](https://docs.astro.build)
- [Main README](README.md)