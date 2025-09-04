# Site Access Control & Theme Management

## Each Site Directory is Completely Self-Contained

```
frontends/
├── codersinflow.com/
│   ├── tailwind.config.js      # Full control over their theme
│   ├── package.json             # Their own dependencies
│   ├── src/
│   │   ├── styles/
│   │   │   └── global.css       # Their custom styles
│   │   ├── components/          # Their custom components
│   │   └── pages/               # Their pages
│   └── .env                     # Their environment vars
│
├── clientabc.com/               # Give client access ONLY to this folder
│   ├── tailwind.config.js      # They control their entire theme
│   ├── src/
│   └── ...
```

## Perfect Access Control Strategy

### 1. Git Submodules for Client Access

```bash
# Main repo structure
/multi-site-project/
├── shared/                      # They DON'T get access
│   ├── backend/                 # Protected
│   └── components/              # Protected
├── frontends/
│   ├── codersinflow.com/        # Your site - protected
│   └── clientabc.com/           # Client's submodule - they have access
```

```bash
# Set up client repo as submodule
cd frontends/
git submodule add https://github.com/clientabc/their-frontend.git clientabc.com

# Give client access ONLY to their repo
# They can push changes to their repo
# You pull their changes into main project
```

### 2. Client's Tailwind Config - Full Control

```javascript
// frontends/clientabc.com/tailwind.config.js
// Client has COMPLETE control over this file
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // They define their entire color scheme
        primary: '#FF5733',
        secondary: '#33FF57',
        dark: '#1a1a1a',
        light: '#f5f5f5',
        
        // Their blog-specific colors
        'blog-bg': '#ffffff',
        'blog-card': '#f0f0f0',
        'blog-text': '#333333',
        'blog-accent': '#FF5733'
      },
      fontFamily: {
        // They choose their fonts
        'heading': ['Montserrat', 'sans-serif'],
        'body': ['Open Sans', 'sans-serif'],
        'code': ['Fira Code', 'monospace']
      },
      spacing: {
        // Custom spacing if needed
        '128': '32rem',
        '144': '36rem'
      }
    }
  },
  plugins: [
    // They can add their own Tailwind plugins
  ]
}
```

### 3. Client's Global Styles

```css
/* frontends/clientabc.com/src/styles/global.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* They define ALL their CSS variables */
:root {
  --primary: 255 87 51;
  --secondary: 51 255 87;
  --background: 255 255 255;
  --foreground: 51 51 51;
  
  /* Blog-specific variables */
  --blog-card-shadow: 0 2px 8px rgba(0,0,0,0.1);
  --blog-border-radius: 8px;
  --blog-header-height: 80px;
}

/* They can override ANY component styling */
.blog-container {
  @apply bg-white text-gray-800;
}

.blog-card {
  @apply bg-gray-50 border-2 border-primary rounded-lg shadow-lg;
}

/* Complete custom styles */
.their-special-component {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  /* Whatever they want */
}
```

### 4. Client Can Override Shared Components

```typescript
// frontends/clientabc.com/src/components/BlogPost.tsx
// They can completely override how blog posts look

import { BlogPost as SharedBlogPost } from '@shared/components/blog';

// Option 1: Extend shared component
export function BlogPost(props) {
  return (
    <SharedBlogPost 
      {...props}
      className="client-custom-style"
      headerComponent={<CustomHeader />}
      footerComponent={<CustomFooter />}
    />
  );
}

// Option 2: Complete replacement
export function BlogPost({ title, content, date }) {
  return (
    <article className="client-blog-post">
      <div className="fancy-gradient-header">
        <h1 className="client-title-style">{title}</h1>
        <time className="client-date-style">{date}</time>
      </div>
      <div className="client-content-wrapper">
        {content}
      </div>
      <ClientCustomShareButtons />
    </article>
  );
}
```

### 5. Directory Permissions Setup

```bash
# Docker approach - mount only their directory
docker run -v /sites/clientabc.com:/app/site client-dev-container

# File system permissions
chown -R clientuser:clientgroup frontends/clientabc.com/
chmod 755 frontends/clientabc.com/

# They can edit everything in their directory
# But can't access other sites or shared backend
```

### 6. Development Access for Clients

```yaml
# docker-compose.client.yml
# Give client a dev environment with ONLY their site
version: '3.8'

services:
  client-dev:
    image: node:20
    volumes:
      - ./frontends/clientabc.com:/app  # Only their site
      - ./shared/components:/shared/components:ro  # Read-only shared
    ports:
      - "3000:3000"
    environment:
      - SITE=clientabc
      - API_URL=https://api.yourdomain.com  # They use production API
    command: npm run dev
```

### 7. Client's Package.json - Their Dependencies

```json
// frontends/clientabc.com/package.json
{
  "name": "clientabc-frontend",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    // They can add any packages they want
    "astro": "^4.0.0",
    "@astrojs/react": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "react": "^18.0.0",
    
    // Their custom packages
    "framer-motion": "^10.0.0",
    "their-favorite-ui-lib": "^2.0.0",
    
    // Shared components (read-only)
    "@shared/components": "file:../../shared/components"
  }
}
```

### 8. Build Process Respects Their Config

```javascript
// build-site.js
function buildSite(siteName) {
  const siteDir = `frontends/${siteName}`;
  
  // Uses THEIR tailwind.config.js
  execSync(`cd ${siteDir} && npx tailwindcss build`);
  
  // Uses THEIR build configuration
  execSync(`cd ${siteDir} && npm run build`);
  
  // Output goes to their dist folder
  // frontends/clientabc.com/dist/
}
```

### 9. Database Access Control

```javascript
// Backend middleware ensures they only access their data
app.use('/api/*', (req, res, next) => {
  const site = req.headers['x-site-id'];
  
  // They can only access their own database
  if (site === 'clientabc') {
    req.database = 'clientabc_db';
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
});
```

### 10. Git Repository Structure for Access Control

```bash
# Option 1: Separate repos
main-project/           # Your private repo
├── shared/            # Your code
├── frontends/
│   ├── codersinflow/  # Your code
│   └── clientabc/     # Submodule pointing to client's repo

clientabc-frontend/     # Client's public repo
├── tailwind.config.js  # They control
├── src/               # They control
└── ...

# Option 2: Branch permissions (GitHub/GitLab)
# Give client write access ONLY to:
# - frontends/clientabc.com/**
# Using CODEOWNERS file:

# .github/CODEOWNERS
/frontends/clientabc.com/ @clientabc-team
/frontends/codersinflow.com/ @your-team
/shared/ @your-team
/backend/ @your-team
```

## Benefits of This Approach

1. **Complete Theme Control** - Clients control every aspect of their site's look
2. **Security** - They can't access backend or other sites
3. **Independence** - They can work without affecting other sites
4. **Version Control** - Their changes are tracked separately
5. **Easy Handoff** - Just give them repo access to their directory
6. **No Training Needed** - They just edit Tailwind/CSS they already know

## Example Client Workflow

```bash
# Client clones only their repo
git clone https://github.com/clientabc/their-frontend.git
cd their-frontend

# They make changes to their Tailwind config
vim tailwind.config.js

# They test locally
npm run dev

# They commit and push
git add .
git commit -m "Updated brand colors"
git push

# You pull their changes into main project
cd frontends/clientabc.com
git pull

# Rebuild container with their changes
docker-compose build
docker-compose up -d
```

## Security Best Practices

1. **Never give access to:**
   - `/shared/backend/`
   - `/shared/database/`
   - Other sites' directories
   - Docker configuration files
   - Environment variables with secrets

2. **Always use read-only mounts for shared components**

3. **Validate their builds in CI/CD before deploying**

4. **Keep their API access limited to their tenant ID**

This gives clients complete control over their site's look and feel while keeping your infrastructure and other clients' sites completely secure!