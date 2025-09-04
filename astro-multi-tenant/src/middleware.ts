import { defineMiddleware } from 'astro:middleware';
import { getTenantFromHost } from './shared/lib/tenant';
import { API_URL } from './shared/lib/api-config';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/blog',
  '/docs',
  '/features',
  '/enterprise',
  '/download',
  '/blog/editor/login',
  '/api/auth/login',
  '/api/auth/register'
];

// Define protected route patterns
const PROTECTED_PATTERNS = [
  /^\/blog\/editor(?!\/login)/,  // All /blog/editor/* except /login
  /^\/admin/,                     // All admin routes
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, url } = context;
  const pathname = url.pathname;
  
  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_PATTERNS.some(pattern => pattern.test(pathname));
  
  // If not protected, continue
  if (!isProtectedRoute) {
    return next();
  }
  
  // Get auth token
  const token = cookies.get('auth-token');
  
  // If no token, redirect to login
  if (!token) {
    return redirect('/blog/editor/login');
  }
  
  // Verify token with backend
  try {
    const hostname = request.headers.get('host') || '127.0.0.1:4321';
    const tenant = getTenantFromHost(hostname);
    const database = tenant.database || tenant.id;
    
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': `auth-token=${token.value}`,
        'X-Site-Database': database
      }
    });
    
    if (!response.ok) {
      // Invalid token, clear it and redirect
      cookies.delete('auth-token', { path: '/' });
      return redirect('/blog/editor/login');
    }
    
    // Token is valid, store user info in locals for pages to use
    const user = await response.json();
    context.locals.user = user;
    context.locals.database = database;
    
  } catch (error) {
    // API error, redirect to login
    console.error('Auth verification failed:', error);
    return redirect('/blog/editor/login');
  }
  
  // User is authenticated, continue
  return next();
});