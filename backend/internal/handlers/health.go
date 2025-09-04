package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/coders-website/backend/internal/database"
	"go.mongodb.org/mongo-driver/bson"
)

type HealthStatus struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Services  map[string]string `json:"services"`
	System    map[string]interface{} `json:"system"`
}

// HealthCheck provides detailed health status of the backend
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	health := HealthStatus{
		Status:    "healthy",
		Timestamp: time.Now().Format(time.RFC3339),
		Services:  make(map[string]string),
		System: map[string]interface{}{
			"goroutines": runtime.NumGoroutine(),
			"memory_mb":  getMemoryUsageMB(),
		},
	}

	// Check MongoDB connectivity
	if database.GetDB() == nil {
		health.Status = "unhealthy"
		health.Services["mongodb"] = "disconnected - database not initialized"
	} else {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		
		// Try to count users to verify database access
		count, err := database.GetCollection("users").CountDocuments(ctx, bson.M{})
		if err != nil {
			health.Status = "unhealthy"
			if err.Error() == "context deadline exceeded" {
				health.Services["mongodb"] = "connection timeout"
			} else if strings.Contains(err.Error(), "server selection timeout") {
				health.Services["mongodb"] = "cannot connect to MongoDB"
			} else {
				health.Services["mongodb"] = "error - " + err.Error()
			}
		} else {
			health.Services["mongodb"] = fmt.Sprintf("healthy (%d users)", count)
		}
	}

	// Check JWT secret configuration
	if os.Getenv("JWT_SECRET") == "" {
		health.Status = "degraded"
		health.Services["jwt"] = "using default secret (not secure for production)"
	} else {
		health.Services["jwt"] = "configured"
	}

	// Set appropriate status code
	statusCode := http.StatusOK
	if health.Status == "unhealthy" {
		statusCode = http.StatusServiceUnavailable
	} else if health.Status == "degraded" {
		statusCode = http.StatusOK // Still return 200 for degraded
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(health)
}

func getMemoryUsageMB() float64 {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return float64(m.Alloc) / 1024 / 1024
}