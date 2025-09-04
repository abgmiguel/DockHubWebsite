package middleware

import (
	"net/http"
	"strings"
	"os"
	"encoding/json"
	"io/ioutil"
)

// AllowedDomains holds the list of allowed domains for CORS
type AllowedDomains struct {
	Domains []string `json:"domains"`
}

// DynamicCORSMiddleware handles CORS for multiple tenant domains
func DynamicCORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		
		// Check if origin is allowed
		if isAllowedOrigin(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Tenant-Domain, X-Tenant-Id, X-Site-Database")
			w.Header().Set("Access-Control-Max-Age", "300")
		}
		
		// Handle preflight
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

// isAllowedOrigin checks if the origin is in our allowed list
func isAllowedOrigin(origin string) bool {
	if origin == "" {
		return false
	}
	
	// Always allow localhost and 127.0.0.1 for development
	if strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
		return true
	}
	
	// Extract domain from origin (remove protocol and port)
	originDomain := origin
	originDomain = strings.TrimPrefix(originDomain, "https://")
	originDomain = strings.TrimPrefix(originDomain, "http://")
	if idx := strings.Index(originDomain, ":"); idx != -1 {
		originDomain = originDomain[:idx]
	}
	
	// Load allowed domains from environment or config
	allowedDomainsStr := os.Getenv("ALLOWED_DOMAINS")
	if allowedDomainsStr != "" {
		allowedDomains := strings.Split(allowedDomainsStr, ",")
		for _, domain := range allowedDomains {
			domain = strings.TrimSpace(domain)
			// Check exact match or subdomain match
			if origin == "https://"+domain || origin == "http://"+domain ||
			   origin == "https://www."+domain || origin == "http://www."+domain {
				return true
			}
		}
	}
	
	// Try loading from sites-config.json
	configPath := os.Getenv("SITES_CONFIG_PATH")
	if configPath == "" {
		configPath = "/app/sites-config.json"
	}
	
	data, err := ioutil.ReadFile(configPath)
	if err == nil {
		var sites map[string]interface{}
		if err := json.Unmarshal(data, &sites); err == nil {
			for domain := range sites {
				if origin == "https://"+domain || origin == "http://"+domain ||
				   origin == "https://www."+domain || origin == "http://www."+domain {
					return true
				}
			}
		}
	}
	
	// In production, be strict - no wildcard allowed
	if os.Getenv("ENV") == "production" {
		return false
	}
	
	// In development, be more permissive
	return true
}