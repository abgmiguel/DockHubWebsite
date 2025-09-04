# Modular Middleware Implementation

## Problem: Response Already Sent Error

When using `Astro.redirect()` inside components wrapped by a Layout, you get:
```
ResponseSentError: Unable to set response. 
The response has already been sent to the browser and cannot be altered.
```

This happens because:
1. Page starts rendering Layout → Headers sent to browser
2. Component inside Layout tries to redirect → Too late!

## Solution: Module-Based Middleware

Each module (blog, shop, forum, etc.) provides its own middleware that runs **before** any rendering begins.

## Implementation

### Step 1: Main Middleware File
The main middleware imports middleware from each module and routes requests accordingly.

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { getTenantFromHost } from './shared/lib/tenant';

// Import middleware from each module
import { blogMiddleware } from './modules/blog/middleware';
// Future modules:
// import { shopMiddleware } from './modules/shop/middleware';
// import { forumMiddleware } from './modules/forum/middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  
  // Add tenant info to context for all requests
  const hostname = request.headers.get('host') || '127.0.0.1:4321';
  const tenant = getTenantFromHost(hostname);
  context.locals.tenant = tenant;
  context.locals.database = tenant.database || tenant.id;
  
  // Route to appropriate module middleware based on path
  if (url.pathname.startsWith('/blog')) {
    return blogMiddleware(context, next);
  }
  
  // Add more modules as needed:
  // if (url.pathname.startsWith('/shop')) {
  //   return shopMiddleware(context, next);
  // }
  
  // No module middleware needed
  return next();
});
```

### Step 2: Module Middleware File
Each module defines its own middleware in a `middleware.ts` file within the module directory.

```typescript
// src/modules/blog/middleware.ts
import { API_URL } from '../../shared/lib/api-config';

export async function blogMiddleware(context, next) {
  const { url, cookies, redirect, locals } = context;
  const pathname = url.pathname;
  
  // Define which routes need authentication
  const PROTECTED_ROUTES = [
    '/blog/editor',
    '/blog/editor/posts',
    '/blog/editor/categories',
    '/blog/editor/users',
    '/blog/editor/change-password'
  ];
  
  const PUBLIC_ROUTES = [
    '/blog/editor/login',
    '/blog/editor/register'
  ];
  
  // Check if this route needs authentication
  const needsAuth = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  ) && !PUBLIC_ROUTES.includes(pathname);
  
  if (!needsAuth) {
    // Route doesn't need auth, continue
    return next();
  }
  
  // Check for auth token
  const token = cookies.get('auth-token');
  
  if (!token) {
    // No token, redirect to login
    return redirect('/blog/editor/login');
  }
  
  // Verify token with backend
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': `auth-token=${token.value}`,
        'X-Site-Database': locals.database
      }
    });
    
    if (!response.ok) {
      // Invalid token, clear it and redirect
      cookies.delete('auth-token', { path: '/' });
      return redirect('/blog/editor/login');
    }
    
    // Token is valid, store user info for components to use
    const user = await response.json();
    locals.user = user;
    
  } catch (error) {
    console.error('Auth verification failed:', error);
    return redirect('/blog/editor/login');
  }
  
  // User is authenticated, continue
  return next();
}
```

### Step 3: Remove Redirects from Components
With middleware handling auth, components become much simpler:

```astro
---
// src/modules/blog/editor/index.astro
// BEFORE: Had redirect logic
const token = Astro.cookies.get('auth-token');
if (!token) {
  return Astro.redirect('/blog/editor/login'); // ❌ Could cause error!
}

// AFTER: Just use the user from middleware
const { user, database } = Astro.locals; // ✅ Middleware already verified!
---

<div>
  <h1>Welcome {user.name}</h1>
  <!-- Component just renders, no auth checks needed -->
</div>
```

## Benefits

1. **No Timing Issues**: Middleware runs before any rendering starts
2. **Module Ownership**: Each module manages its own auth/logic
3. **Clean Separation**: Middleware in module folder, not mixed with main app
4. **Reusability**: Can copy entire module (including middleware) to another project
5. **Multi-Tenant Support**: Middleware has access to tenant info from context

## Adding a New Module

When creating a new module that needs middleware:

1. Create `src/modules/yourmodule/middleware.ts`
2. Export your middleware function
3. Import it in `src/middleware.ts`
4. Add routing logic for your module's paths

Example for a shop module:
```typescript
// src/modules/shop/middleware.ts
export async function shopMiddleware(context, next) {
  // Shop-specific middleware logic
  // Check cart, verify payment methods, etc.
  return next();
}
```

Then add to main middleware:
```typescript
// src/middleware.ts
import { shopMiddleware } from './modules/shop/middleware';

// In onRequest:
if (url.pathname.startsWith('/shop')) {
  return shopMiddleware(context, next);
}
```

## Key Points

- Middleware runs **before** rendering = safe to redirect
- Each module owns its middleware = better organization
- Components just render = no redirect logic needed
- Works with multi-tenant = each request has tenant info