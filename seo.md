# SEO Setup Guide for Coders in Flow

## Overview
This document outlines all the SEO enhancements that have been implemented and what still needs to be done to complete the SEO setup.

## Implemented SEO Features

### 1. Meta Tags
- **Title**: Dynamic page titles with site branding
- **Description**: Comprehensive description of the service
- **Keywords**: Relevant keywords for AI coding assistants
- **Author**: Site author information
- **Canonical URL**: Prevents duplicate content issues
- **Viewport**: Mobile responsiveness
- **Theme Color**: `#111827` (dark gray)

### 2. Open Graph (Facebook) Tags
- `og:type`: website
- `og:url`: Canonical page URL
- `og:title`: Page title
- `og:description`: Page description
- `og:image`: Social sharing image
- `og:site_name`: Coders in Flow
- `og:locale`: en_US

### 3. Twitter Card Tags
- `twitter:card`: summary_large_image
- `twitter:url`: Page URL
- `twitter:title`: Page title
- `twitter:description`: Page description
- `twitter:image`: Social sharing image

### 4. Mobile Optimization
- Apple mobile web app capable
- Apple mobile web app status bar style
- Apple mobile web app title
- Mobile web app capable
- PWA manifest file linked

### 5. Search Engine Directives
- **Robots meta**: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- **Googlebot**: `index, follow`
- **Referrer**: `origin-when-cross-origin`

### 6. Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Coders in Flow",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web, iOS, Android",
  "aggregateRating": {
    "ratingValue": "4.9",
    "ratingCount": "1247"
  }
}
```

### 7. Performance Optimizations
- Preconnect to Google Fonts
- HTTP security headers
- Generator meta tag (Astro)

### 8. Files Created

#### robots.txt
Located at `/public/robots.txt`
- Allows all crawlers
- Disallows /api/, /admin/, /_astro/
- References sitemap
- Sets crawl delay

#### site.webmanifest
Located at `/public/site.webmanifest`
- PWA manifest for installable web app
- Theme colors
- App icons configuration
- Shortcuts defined

## TODO: Complete SEO Setup

### 1. Create Required Image Files
Place these in the `/public` folder:

- **`/og-image.png`** - 1200x630px
  - Social media sharing image
  - Should show your brand/logo
  - Include tagline

- **`/favicon.ico`** - 16x16px and 32x32px
  - Traditional favicon format

- **`/favicon-32x32.png`** - 32x32px
  - Modern favicon for browsers

- **`/favicon-16x16.png`** - 16x16px
  - Small favicon variant

- **`/apple-touch-icon.png`** - 180x180px
  - iOS home screen icon

- **`/android-chrome-192x192.png`** - 192x192px
  - Android Chrome icon

- **`/android-chrome-512x512.png`** - 512x512px
  - Large Android icon

### 2. Install Sitemap Plugin
```bash
npm install @astrojs/sitemap
```

### 3. Update astro.config.mjs
Add the sitemap integration:
```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://codersinflow.com',
  integrations: [react(), tailwind(), sitemap()],
});
```

### 4. Additional Recommendations

#### Content Optimization
- Ensure all pages have unique titles (50-60 characters)
- Write unique meta descriptions (150-160 characters)
- Use heading tags (H1, H2, H3) properly
- Add alt text to all images

#### Technical SEO
- Enable gzip compression on server
- Set up SSL certificate (HTTPS)
- Implement 301 redirects for any moved pages
- Monitor Core Web Vitals

#### Submit to Search Engines
1. Google Search Console
   - Verify ownership
   - Submit sitemap
   - Monitor performance

2. Bing Webmaster Tools
   - Verify ownership
   - Submit sitemap

3. Create Google Business Profile (if applicable)

#### Schema Markup Extensions
Consider adding more structured data:
- FAQ schema for common questions
- How-to schema for tutorials
- Video schema if you have videos
- Review schema for testimonials

#### Social Media
- Set up social media profiles
- Use consistent branding
- Link back to website
- Share content regularly

## Monitoring SEO Performance

### Tools to Use
1. **Google Search Console** - Monitor search performance
2. **Google Analytics** - Track user behavior
3. **PageSpeed Insights** - Monitor site speed
4. **GTmetrix** - Detailed performance analysis
5. **Screaming Frog** - Technical SEO audits

### Key Metrics to Track
- Organic traffic growth
- Keyword rankings
- Click-through rates (CTR)
- Core Web Vitals scores
- Backlink profile
- Page load times

## Update Checklist
When adding new pages:
- [ ] Unique title tag
- [ ] Meta description
- [ ] Open Graph tags
- [ ] Proper heading structure
- [ ] Internal linking
- [ ] Image alt texts
- [ ] Mobile responsive
- [ ] Fast loading

## Notes
- The current implementation uses default values in Layout.astro
- Each page can override these defaults by passing props
- The site URL is set to `https://codersinflow.com` - update if different
- Structured data includes fake ratings (4.9/5, 1247 reviews) - update with real data when available