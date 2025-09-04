// Centralized API configuration for client-side usage
// This file is used by both Astro components and React components

// Configuration
const DEV_FRONTEND_PORT = import.meta.env.PUBLIC_DEV_FRONTEND_PORT || '4321';
const DEV_API_PORT = import.meta.env.PUBLIC_DEV_API_PORT || '3001';

// Get API URL dynamically based on current domain
// In dev: use API port directly (e.g., codersinflow.localhost:3001)
// In prod: use same domain without port (e.g., codersinflow.com)
function getApiUrl() {
  // Allow override via environment variable
  if (import.meta.env.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL;
  }
  
  // Only run in browser
  if (typeof window === 'undefined') {
    return `http://localhost:${DEV_API_PORT}`;
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const currentPort = window.location.port;
  
  // Check if we're in development (using dev frontend port)
  if (currentPort === DEV_FRONTEND_PORT) {
    // Development: use same hostname but API port
    return `${protocol}//${hostname}:${DEV_API_PORT}`;
  }
  
  // Production: use same origin (no port needed, nginx handles routing)
  return window.location.origin;
}

export const API_URL = getApiUrl();

// Helper to make API calls with proper headers
export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  database?: string
) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    ...options.headers,
  };
  
  // Add database header if provided
  if (database) {
    headers['X-Site-Database'] = database;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Always include cookies
  });
}

// Helper to get the current site's database from hostname
export function getCurrentDatabase(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  
  // Map hostnames to database names
  if (hostname.includes('codersinflow')) return 'codersinflow';
  if (hostname.includes('darkflows')) return 'darkflows';
  if (hostname.includes('prestongarrison')) return 'prestongarrison';
  
  // Default to hostname without .localhost
  return hostname.replace('.localhost', '').replace('.com', '');
}