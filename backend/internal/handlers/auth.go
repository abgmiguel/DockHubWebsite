package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/middleware"
	"github.com/coders-website/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Check database connectivity first
	if database.GetDB() == nil {
		http.Error(w, "Database unavailable - please contact support", http.StatusServiceUnavailable)
		return
	}

	// Auto-create admin user if it doesn't exist (only for admin@codersinflow.com)
	if req.Email == "admin@codersinflow.com" && req.Password == "c0dersinflow" {
		var existingAdmin models.User
		err := database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"email": "admin@codersinflow.com"}).Decode(&existingAdmin)
		if err == mongo.ErrNoDocuments {
			// Admin doesn't exist, create it
			newAdmin := models.User{
				ID:        primitive.NewObjectID(),
				Email:     "admin@codersinflow.com",
				Name:      "Admin",
				Password:  "c0dersinflow",
				Role:      "admin",
				Approved:  true,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			
			// Hash the password
			if err := newAdmin.HashPassword(); err != nil {
				http.Error(w, "Failed to create admin user", http.StatusInternalServerError)
				return
			}
			
			// Insert the admin user
			if _, err := database.GetCollectionFromRequest(r, "users").InsertOne(context.Background(), newAdmin); err != nil {
				http.Error(w, "Failed to create admin user", http.StatusInternalServerError)
				return
			}
		}
	}

	// Find user by email (normal login flow)
	var user models.User
	err := database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		} else if err.Error() == "context deadline exceeded" || err.Error() == "server selection timeout" {
			http.Error(w, "Database connection timeout - please try again", http.StatusServiceUnavailable)
			return
		} else {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Check password
	if err := user.ComparePassword(req.Password); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Check if user is approved
	if !user.Approved {
		http.Error(w, "Account pending approval - please contact admin", http.StatusForbidden)
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.ID.Hex(),
		"email":  user.Email,
		"role":   user.Role,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	})

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default-dev-secret-change-in-production"
	}
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		http.Error(w, "Token generation failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Set cookie with SameSite=Lax (works since frontend and backend are on same domain)
	http.SetCookie(w, &http.Cookie{
		Name:     "auth-token",
		Value:    tokenString,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production", // HTTPS in production
		SameSite: http.SameSiteLaxMode, // Works for same-site requests
		MaxAge:   60 * 60 * 24 * 7, // 7 days
	})

	// Return user info
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": user,
		"token": tokenString,
	})
}

func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request data: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" || req.Name == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Check database connectivity
	if database.GetDB() == nil {
		http.Error(w, "Database unavailable - please contact support", http.StatusServiceUnavailable)
		return
	}

	// Check if user already exists
	count, err := database.GetCollectionFromRequest(r, "users").CountDocuments(context.Background(), bson.M{"email": req.Email})
	if err != nil {
		if err.Error() == "context deadline exceeded" || err.Error() == "server selection timeout" {
			http.Error(w, "Database connection timeout - please try again", http.StatusServiceUnavailable)
		} else {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}
	if count > 0 {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Create new user
	user := models.User{
		ID:        primitive.NewObjectID(),
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Role:      "user",
		Approved:  false, // Require admin approval
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Hash password
	if err := user.HashPassword(); err != nil {
		http.Error(w, "Password processing failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert user
	_, err = database.GetCollectionFromRequest(r, "users").InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Registration successful. Please wait for admin approval.",
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func Logout(w http.ResponseWriter, r *http.Request) {
	// Clear cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "auth-token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}

func GetMe(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required,min=8"`
}

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Get full user from DB to check password
	var fullUser models.User
	err := database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"_id": user.ID}).Decode(&fullUser)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Check current password
	if err := fullUser.ComparePassword(req.CurrentPassword); err != nil {
		http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
		return
	}

	// Hash new password
	fullUser.Password = req.NewPassword
	if err := fullUser.HashPassword(); err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	hashedPassword := fullUser.Password

	// Update password in database
	_, err = database.GetCollectionFromRequest(r, "users").UpdateOne(
		context.Background(),
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"password": hashedPassword,
			"updatedAt": time.Now(),
		}},
	)
	if err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password changed successfully",
	})
}

func CheckAdmin(w http.ResponseWriter, r *http.Request) {
	// Check if admin user exists
	var user models.User
	err := database.GetCollectionFromRequest(r, "users").FindOne(
		context.Background(),
		bson.M{"email": "admin@codersinflow.com"},
	).Decode(&user)
	
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Admin not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists": true,
		"email": user.Email,
	})
}

func CreateAdmin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Check if admin already exists
	var existingUser models.User
	err := database.GetCollectionFromRequest(r, "users").FindOne(
		context.Background(),
		bson.M{"email": req.Email},
	).Decode(&existingUser)
	
	if err == nil {
		// User already exists
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}
	
	if err != mongo.ErrNoDocuments {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	
	// Create the admin user
	newAdmin := models.User{
		ID:        primitive.NewObjectID(),
		Email:     req.Email,
		Name:      req.Name,
		Password:  req.Password,
		Role:      "admin",
		Approved:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	// Hash the password
	if err := newAdmin.HashPassword(); err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	
	// Insert the admin user
	if _, err := database.GetCollectionFromRequest(r, "users").InsertOne(context.Background(), newAdmin); err != nil {
		http.Error(w, "Failed to create admin user", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Admin user created successfully",
		"user": map[string]string{
			"id":    newAdmin.ID.Hex(),
			"email": newAdmin.Email,
			"name":  newAdmin.Name,
		},
	})
}