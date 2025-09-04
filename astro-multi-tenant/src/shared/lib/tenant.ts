import fs from 'fs';
import path from 'path';

export interface SiteConfig {
  id: string;
  directory: string;
  database: string;
  theme: string;
  features: string[];
}

let sitesConfig: Record<string, SiteConfig> | null = null;
let configFilePath: string | null = null;
let lastModifiedTime: number = 0;

export function getSitesConfig(): Record<string, SiteConfig> {
  const isDev = import.meta.env?.DEV || process.env.NODE_ENV === 'development';
  
  // Check if config file has been modified
  let shouldReload = false;
  if (isDev && configFilePath && fs.existsSync(configFilePath)) {
    const stats = fs.statSync(configFilePath);
    const currentModifiedTime = stats.mtimeMs;
    if (currentModifiedTime > lastModifiedTime) {
      shouldReload = true;
      lastModifiedTime = currentModifiedTime;
    }
  }
  
  if (!sitesConfig || shouldReload) {
    const configPath = process.env.SITES_CONFIG_PATH || '/app/sites-config.json';
    
    // For development, try relative path
    const paths = [
      configPath,
      path.join(process.cwd(), 'sites-config.json'),
      path.join(process.cwd(), '..', 'sites-config.json')
    ];
    
    for (const p of paths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        sitesConfig = JSON.parse(content);
        configFilePath = p;
        
        // Update last modified time
        const stats = fs.statSync(p);
        lastModifiedTime = stats.mtimeMs;
        
        if (shouldReload) {
          console.log('[tenant.ts] Sites config changed, reloaded from:', p);
        }
        break;
      }
    }
    
    if (!sitesConfig) {
      // Fallback config
      sitesConfig = {
        '127.0.0.1': {
          id: 'default',
          directory: 'default',
          database: 'default_db',
          theme: 'light',
          features: ['blog']
        },
        'localhost': {
          id: 'default',
          directory: 'default',
          database: 'default_db',
          theme: 'light',
          features: ['blog']
        },
        'default': {
          id: 'default',
          directory: 'default',
          database: 'default_db',
          theme: 'light',
          features: ['blog']
        }
      };
    }
  }
  
  return sitesConfig;
}

export function getTenantFromHost(hostname: string, urlParams?: URLSearchParams): SiteConfig {
  const sites = getSitesConfig();
  
  // Check for query parameter override first
  if (urlParams) {
    const siteOverride = urlParams.get('site') || urlParams.get('website') || urlParams.get('tenant');
    if (siteOverride) {
      // Add .com if not present
      const siteDomain = siteOverride.includes('.') ? siteOverride : `${siteOverride}.com`;
      if (sites[siteDomain]) {
        return sites[siteDomain];
      }
    }
  }
  
  // Remove port and www
  let domain = hostname
    .replace(/:\d+$/, '')
    .replace(/^www\./, '');
  
  // Check for exact match first (including .localhost domains)
  if (sites[domain]) {
    return sites[domain];
  }
  
  // If .localhost domain not found, try to find matching production domain
  // This is a fallback for backwards compatibility
  if (domain.endsWith('.localhost')) {
    const siteId = domain.replace('.localhost', '');
    // Look for any domain that starts with this site ID
    for (const [key, config] of Object.entries(sites)) {
      if (config.id === siteId) {
        return config;
      }
    }
  }
  
  // Check for localhost/127.0.0.1 - return first site or default
  if (domain === 'localhost' || domain === '127.0.0.1') {
    // Return the first configured site as default
    const firstSite = Object.keys(sites).find(key => key.endsWith('.com'));
    if (firstSite && sites[firstSite]) {
      return sites[firstSite];
    }
    return sites['default'] || sites['codersinflow.com'];
  }
  
  // Check with www prefix
  const withWww = `www.${domain}`;
  if (sites[withWww]) {
    return sites[withWww];
  }
  
  // Fallback to default
  return sites['default'] || sites['codersinflow.com'] || {
    id: 'default',
    directory: 'default',
    database: 'default_db',
    theme: 'light',
    features: ['blog']
  };
}

export function getTenantDirectory(tenant: SiteConfig): string {
  return tenant.directory || tenant.id || 'default';
}

export function getTenantApiHeaders(hostname: string) {
  const tenant = getTenantFromHost(hostname);
  return {
    'X-Tenant-Domain': hostname.replace(/:\d+$/, ''),
    'X-Tenant-Id': tenant.id,
    'X-Site-Database': tenant.database
  };
}