# Astro Multi-Tenant Platform

A single Astro application that serves multiple websites dynamically based on hostname, with complete style isolation and individual site customization.

## 🎯 Overview

This platform allows you to run multiple websites from a single Astro server instance. Each site has its own:
- Custom design and theming
- Pre-generated Tailwind CSS
- Configuration and metadata
- Pages and components
- Data files for content

## 🏗️ Architecture

### Single SmartLayout System

The key innovation is the **SmartLayout** (`src/layouts/SmartLayout.astro`) - a single universal layout that:
1. Detects the current tenant from the hostname
2. Dynamically loads the appropriate CSS file
3. Loads site-specific configuration and data
4. Conditionally renders navigation and footer components

This approach completely eliminates style contamination between sites since only one layout exists and CSS is loaded dynamically per tenant.

### Directory Structure

```
src/
├── layouts/
│   └── SmartLayout.astro      # Universal layout for all sites
├── pages/
│   └── [...slug].astro        # Dynamic router for all routes
├── shared/
│   ├── components/            # Shared React/Astro components
│   ├── lib/                   # Utilities and helpers
│   └── integrations/          # Astro integrations
└── sites/
    ├── codersinflow.com/
    │   ├── config.json        # Site configuration
    │   ├── data/              # Site-specific data files
    │   ├── pages/             # Site pages (no layouts!)
    │   ├── styles/
    │   │   └── main.css       # Pre-generated Tailwind CSS
    │   └── tailwind.config.cjs # Site-specific Tailwind config
    ├── darkflows.com/
    ├── prestongarrison.com/
    └── ...other sites

```

## 🚀 How It Works

### 1. Request Routing

When a request comes in:
1. The `[...slug].astro` router captures all routes
2. It extracts the hostname from the request headers
3. Uses `getTenantFromHost()` to identify the site
4. Loads the appropriate page component from that site's `/pages` directory
5. Wraps it in the SmartLayout

### 2. Style Isolation

Each site has its own Tailwind configuration and pre-generated CSS:
1. Run `npm run generate-css` to build CSS for all sites
2. Each site's CSS is output to `sites/[site]/styles/main.css`
3. SmartLayout loads only the CSS for the current tenant
4. No style contamination between sites!

### 3. Development Mode

Run individual sites in development:
```bash
npm run dev:prestongarrison    # Run prestongarrison.com
npm run dev:darkflows          # Run darkflows.com
npm run dev:codersinflow       # Run codersinflow.com
```

The Vite plugin filters files based on the `SITE` environment variable to improve performance.

### 4. Production Mode

In production, all sites run from a single server:
```bash
npm run build
npm run preview
```

Access sites via:
- Direct hostname (e.g., `prestongarrison.com`)
- Query parameter override: `?tenant=darkflows.com`

## 🛠️ Adding a New Site

### Automated Method (Recommended)

Use the add-site script to quickly create a new site:

```bash
# Basic usage
./scripts/add-site.sh example.com

# With options
./scripts/add-site.sh mysite.com \
  --name "My Awesome Site" \
  --description "A fantastic website" \
  --theme dark-blue \
  --features blog,auth,payments
```

The script will:
- Create the site directory from template
- Configure all necessary files
- Update sites-config.json
- Set up Tailwind configuration
- Create page templates without Layout wrappers

### Manual Method

1. **Create site directory:**
   ```bash
   mkdir -p src/sites/newsite.com/{pages,data,styles}
   ```

2. **Add configuration:**
   ```json
   // src/sites/newsite.com/config.json
   {
     "name": "New Site",
     "description": "Site description",
     "fonts": {
       "google": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
     }
   }
   ```

3. **Create Tailwind config:**
   ```javascript
   // src/sites/newsite.com/tailwind.config.cjs
   module.exports = {
     content: [
       './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
       './src/sites/newsite.com/**/*.{astro,tsx}',
       './src/shared/components/**/*.{jsx,tsx}',
       './src/layouts/**/*.{astro,tsx}'
     ],
     theme: {
       extend: {
         colors: {
           'background': '#FFFFFF',
           'text-primary': '#000000',
           // ... your colors
         }
       }
     }
   }
   ```

4. **Add pages (NO Layout wrapper!):**
   ```astro
   // src/sites/newsite.com/pages/index.astro
   ---
   // Import components but NO Layout!
   import Hero from '../../../shared/components/Hero.jsx';
   ---
   
   <main>
     <Hero />
     <!-- Your content -->
   </main>
   ```

5. **Generate CSS:**
   ```bash
   npm run generate-css
   ```

6. **Update sites-config.json** (or use the script which does this automatically)

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run dev:[site]` - Start dev server for specific site
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate-css` - Generate Tailwind CSS for all sites
- `./scripts/add-site.sh` - Add a new site to the platform
- `./scripts/remove-site.sh` - Remove a site from the platform

## 🔧 Key Components

### SmartLayout
Universal layout that handles all sites. Loads CSS and config dynamically based on hostname.

### Dynamic Router (`[...slug].astro`)
Catches all routes and loads the appropriate page component from the correct site directory.

### Auto-Wrapper Integration
Vite plugin that automatically wraps components with data based on JSON files.

### Tenant Detection
`getTenantFromHost()` function that identifies sites from:
1. Query parameter (`?tenant=site.com`)
2. Hostname
3. Environment variable (`SITE`)

## 🎨 Theming

Each site can have completely different themes:
- Light/dark modes
- Custom color schemes
- Different fonts
- Unique component styles

All managed through individual Tailwind configs without any cross-contamination.

## 🚨 Important Notes

1. **Never add Layout imports to page files** - The router handles layout wrapping
2. **Always regenerate CSS after color changes** - Run `npm run generate-css`
3. **Use semantic color names** - Like `background`, `text-primary` instead of `white`, `black`
4. **Test in production mode** - Some behaviors differ between dev and production

## 🐛 Troubleshooting

### Styles not updating
1. Run `npm run generate-css`
2. Restart the dev server
3. Clear browser cache

### Wrong site loading
1. Check the hostname in browser
2. Try with `?tenant=sitename.com` parameter
3. Verify site config in `sites-config.js`

### Images not loading
1. Check if images are in `/public` directory
2. Verify correct file extensions (`.jpg` vs `.png`)
3. Update references in data JSON files

## 📝 License

[Your License Here]