package middleware

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

type SiteConfig struct {
	ID       string   `json:"id"`
	Directory string  `json:"directory"`
	Database string   `json:"database"`
	Theme    string   `json:"theme"`
	Features []string `json:"features"`
}

var sitesConfig map[string]SiteConfig

func init() {
	// Load sites configuration
	configPath := os.Getenv("SITES_CONFIG_PATH")
	if configPath == "" {
		configPath = "/app/sites-config.json"
	}
	
	data, err := ioutil.ReadFile(configPath)
	if err != nil {
		// Use default config if file not found
		sitesConfig = map[string]SiteConfig{
			"default": {
				ID:       "default",
				Directory: "default",
				Database: "coders_website",
				Theme:    "light",
				Features: []string{"blog"},
			},
		}
		return
	}
	
	if err := json.Unmarshal(data, &sitesConfig); err != nil {
		// Fallback to default
		sitesConfig = map[string]SiteConfig{
			"default": {
				ID:       "default",
				Directory: "default",
				Database: "coders_website",
				Theme:    "light",
				Features: []string{"blog"},
			},
		}
	}
}

// TenantMiddleware extracts tenant information from the request
func TenantMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get tenant info from headers (set by frontend proxy)
		tenantDomain := r.Header.Get("X-Tenant-Domain")
		tenantID := r.Header.Get("X-Tenant-Id")
		tenantDB := r.Header.Get("X-Site-Database")
		
		// Fallback to host header if not set
		if tenantDomain == "" {
			host := r.Host
			if colonIndex := strings.Index(host, ":"); colonIndex != -1 {
				host = host[:colonIndex]
			}
			tenantDomain = host
		}
		
		// Get site config
		siteConfig, exists := sitesConfig[tenantDomain]
		if !exists {
			// Try without www
			if strings.HasPrefix(tenantDomain, "www.") {
				tenantDomain = strings.TrimPrefix(tenantDomain, "www.")
				siteConfig, exists = sitesConfig[tenantDomain]
			}
			
			// Fall back to default
			if !exists {
				siteConfig = sitesConfig["default"]
			}
		}
		
		// Override with header values if provided
		if tenantID != "" {
			siteConfig.ID = tenantID
		}
		if tenantDB != "" {
			siteConfig.Database = tenantDB
		}
		
		// Add tenant info to context
		ctx := context.WithValue(r.Context(), "tenant_id", siteConfig.ID)
		ctx = context.WithValue(ctx, "tenant_domain", tenantDomain)
		ctx = context.WithValue(ctx, "tenant_database", siteConfig.Database)
		ctx = context.WithValue(ctx, "tenant_config", siteConfig)
		
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetTenantID retrieves the tenant ID from the request context
func GetTenantID(r *http.Request) string {
	if tenantID, ok := r.Context().Value("tenant_id").(string); ok {
		return tenantID
	}
	return "default"
}

// GetTenantDatabase retrieves the tenant database from the request context
func GetTenantDatabase(r *http.Request) string {
	if tenantDB, ok := r.Context().Value("tenant_database").(string); ok {
		return tenantDB
	}
	return "coders_website"
}

// GetTenantConfig retrieves the full tenant configuration from the request context
func GetTenantConfig(r *http.Request) SiteConfig {
	if config, ok := r.Context().Value("tenant_config").(SiteConfig); ok {
		return config
	}
	return sitesConfig["default"]
}