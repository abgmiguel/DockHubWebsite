package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/handlers"
	"github.com/coders-website/backend/internal/middleware"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file from root directory
	if err := godotenv.Load("../.env"); err != nil {
		// Fallback to local .env for backward compatibility
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
	}

	// Connect to MongoDB
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Disconnect()

	// Initialize router
	router := mux.NewRouter()
	
	// Apply CORS middleware FIRST (before any routes)
	router.Use(middleware.DynamicCORSMiddleware)
	
	// Apply tenant middleware second
	router.Use(middleware.TenantMiddleware)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Public routes
	api.HandleFunc("/version", handlers.GetVersion).Methods("GET", "OPTIONS")
	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET", "OPTIONS")
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/register", handlers.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/check-admin", handlers.CheckAdmin).Methods("GET", "OPTIONS")
	api.HandleFunc("/auth/create-admin", handlers.CreateAdmin).Methods("POST", "OPTIONS")
	api.HandleFunc("/posts", handlers.GetPosts).Methods("GET", "OPTIONS")
	api.HandleFunc("/posts/{slug}", handlers.GetPostBySlug).Methods("GET", "OPTIONS")
	api.HandleFunc("/categories", handlers.GetCategories).Methods("GET", "OPTIONS")
	
	// Component data routes (consider protecting these in production)
	api.HandleFunc("/component-data", handlers.GetComponentData).Methods("GET", "OPTIONS")
	api.HandleFunc("/component-data", handlers.UpdateComponentData).Methods("PUT", "OPTIONS")
	api.HandleFunc("/components", handlers.ListComponentData).Methods("GET", "OPTIONS")
	api.HandleFunc("/reorder-components", handlers.ReorderComponents).Methods("POST", "OPTIONS")
	
	// Temporarily public for testing
	api.HandleFunc("/social/test", handlers.TestSocialConnectionSimple).Methods("POST", "OPTIONS")

	// Protected routes
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	// Auth routes
	protected.HandleFunc("/auth/logout", handlers.Logout).Methods("POST", "OPTIONS")
	protected.HandleFunc("/auth/me", handlers.GetMe).Methods("GET", "OPTIONS")
	protected.HandleFunc("/auth/change-password", handlers.ChangePassword).Methods("POST", "OPTIONS")

	// Admin routes
	protected.HandleFunc("/posts", handlers.CreatePost).Methods("POST")
	protected.HandleFunc("/posts/id/{id}", handlers.GetPostByID).Methods("GET")
	protected.HandleFunc("/posts/{id}", handlers.UpdatePost).Methods("PUT")
	protected.HandleFunc("/posts/{id}", handlers.DeletePost).Methods("DELETE")
	protected.HandleFunc("/categories", handlers.CreateCategory).Methods("POST")
	protected.HandleFunc("/categories/{id}", handlers.UpdateCategory).Methods("PUT")
	protected.HandleFunc("/categories/{id}", handlers.DeleteCategory).Methods("DELETE")
	protected.HandleFunc("/upload", handlers.UploadFile).Methods("POST")

	// User management
	protected.HandleFunc("/users/{id}", handlers.UpdateUser).Methods("PUT") // Users can update their own profile
	
	// Admin only user management
	admin := protected.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.AdminMiddleware)
	admin.HandleFunc("/users", handlers.GetUsers).Methods("GET")
	admin.HandleFunc("/users/{id}", handlers.GetUserByID).Methods("GET")
	admin.HandleFunc("/users", handlers.CreateUser).Methods("POST")
	admin.HandleFunc("/users/{id}/approve", handlers.ApproveUser).Methods("PUT")
	admin.HandleFunc("/users/{id}/role", handlers.UpdateUserRole).Methods("PUT")
	admin.HandleFunc("/users/{id}", handlers.DeleteUser).Methods("DELETE")

	// Social media routes (temporarily disabled for protected routes)
	// protected.HandleFunc("/social/test", handlers.TestSocialConnection).Methods("POST")
	protected.HandleFunc("/social/credentials", handlers.SaveSocialCredentials).Methods("POST")
	protected.HandleFunc("/social/publish", handlers.PublishToSocialMedia).Methods("POST")

	// Serve uploaded files
	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// Server configuration
	port := os.Getenv("API_PORT")
	if port == "" {
		// Fallback to PORT for backward compatibility
		port = os.Getenv("PORT")
	}
	if port == "" {
		// Try to read from app-config.json
		if configData, err := os.ReadFile("../app-config.json"); err == nil {
			var config map[string]interface{}
			if err := json.Unmarshal(configData, &config); err == nil {
				if server, ok := config["server"].(map[string]interface{}); ok {
					if ports, ok := server["ports"].(map[string]interface{}); ok {
						if backendPort, ok := ports["backend"].(float64); ok {
							port = fmt.Sprintf("%d", int(backendPort))
						}
					}
				}
			}
		}
		// Final fallback
		if port == "" {
			port = "3001"
		}
	}
	
	srv := &http.Server{
		Handler:      router,
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("Server starting on port %s...", port)
	log.Fatal(srv.ListenAndServe())
}