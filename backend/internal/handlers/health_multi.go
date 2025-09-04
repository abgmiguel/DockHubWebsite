package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/middleware"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type TenantHealth struct {
	Status   string    `json:"status"`
	Database bool      `json:"database"`
	Posts    int64     `json:"posts_count"`
	Users    int64     `json:"users_count"`
	LastPost time.Time `json:"last_post"`
	Storage  struct {
		Used  int64 `json:"used_bytes"`
		Files int64 `json:"file_count"`
	} `json:"storage"`
}

type SystemHealth struct {
	Status      string                  `json:"status"`
	Timestamp   time.Time               `json:"timestamp"`
	Uptime      string                  `json:"uptime"`
	TotalTenants int                    `json:"total_tenants"`
	Tenants     map[string]TenantHealth `json:"tenants,omitempty"`
}

// HealthCheckMultiTenant provides detailed health status for multi-tenant system
func HealthCheckMultiTenant(w http.ResponseWriter, r *http.Request) {
	// Check if this is an admin request (show all tenants)
	showAll := r.URL.Query().Get("all") == "true"
	
	health := SystemHealth{
		Status:    "healthy",
		Timestamp: time.Now(),
		Uptime:    time.Since(startTime).String(),
		Tenants:   make(map[string]TenantHealth),
	}
	
	if showAll {
		// Admin view - check all tenants
		// TODO: Verify admin authentication
		health.Tenants = checkAllTenants()
		health.TotalTenants = len(health.Tenants)
	} else {
		// Single tenant view
		tenantID := middleware.GetTenantID(r)
		tenantDB := middleware.GetTenantDatabase(r)
		
		tenantHealth := checkTenantHealth(tenantID, tenantDB)
		health.Tenants[tenantID] = tenantHealth
		health.TotalTenants = 1
		
		if tenantHealth.Status != "healthy" {
			health.Status = "degraded"
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(health)
}

func checkTenantHealth(tenantID string, dbName string) TenantHealth {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	health := TenantHealth{
		Status: "healthy",
	}
	
	// Check database connection
	db := database.GetTenantDB(dbName)
	if err := db.Client().Ping(ctx, nil); err != nil {
		health.Status = "unhealthy"
		health.Database = false
		return health
	}
	health.Database = true
	
	// Get post count
	postsCollection := db.Collection("posts")
	postCount, _ := postsCollection.CountDocuments(ctx, map[string]interface{}{})
	health.Posts = postCount
	
	// Get user count
	usersCollection := db.Collection("users")
	userCount, _ := usersCollection.CountDocuments(ctx, map[string]interface{}{})
	health.Users = userCount
	
	// Get last post time
	var lastPost map[string]interface{}
	opts := options.FindOne().SetSort(map[string]int{"createdAt": -1})
	postsCollection.FindOne(ctx, map[string]interface{}{}, opts).Decode(&lastPost)
	if createdAt, ok := lastPost["createdAt"].(time.Time); ok {
		health.LastPost = createdAt
	}
	
	// TODO: Calculate storage usage for tenant
	// This would require scanning the uploads/{tenantID} directory
	
	return health
}

func checkAllTenants() map[string]TenantHealth {
	// TODO: Load from sites-config.json and check each tenant
	tenants := make(map[string]TenantHealth)
	
	// For now, return empty map
	// In production, iterate through all configured tenants
	
	return tenants
}