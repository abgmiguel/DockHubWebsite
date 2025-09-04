package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/middleware"
	"github.com/coders-website/backend/internal/models"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Helper function to safely get string from BSON map
func getString(m bson.M, key string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	cursor, err := database.GetCollectionFromRequest(r, "users").Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err := cursor.All(context.Background(), &users); err != nil {
		http.Error(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Decode directly into User struct
	var user models.User
	err = database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// If Social is nil, initialize it with empty structs so it shows up in JSON
	if user.Social == nil {
		user.Social = &models.SocialCredentials{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// UpdateUser handles updating user profile including social media settings
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Check if user is updating their own profile or is admin
	currentUser, ok := r.Context().Value(middleware.UserContextKey).(*models.User)
	if !ok || currentUser == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}
	
	currentUserID := currentUser.ID.Hex()
	currentUserRole := currentUser.Role
	
	if currentUserID != vars["id"] && currentUserRole != "admin" {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	// Parse request body
	var req struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
		Social struct {
			Reddit struct {
				ClientID     string `json:"client_id"`
				ClientSecret string `json:"client_secret"`
				Username     string `json:"username"`
				Password     string `json:"password"`
				Subreddits   string `json:"subreddits"`
			} `json:"reddit"`
			Devto struct {
				APIKey string `json:"api_key"`
			} `json:"devto"`
			LinkedIn struct {
				AccessToken string `json:"access_token"`
			} `json:"linkedin"`
			Facebook struct {
				PageID          string `json:"page_id"`
				PageAccessToken string `json:"page_access_token"`
			} `json:"facebook"`
			Twitter struct {
				APIKey            string `json:"api_key"`
				APISecret         string `json:"api_secret"`
				AccessToken       string `json:"access_token"`
				AccessTokenSecret string `json:"access_token_secret"`
			} `json:"twitter"`
		} `json:"social"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Prepare update document
	update := bson.M{
		"$set": bson.M{
			"email": req.Email,
			"name":  req.Name,
			"social": bson.M{
				"reddit": bson.M{
					"client_id":     req.Social.Reddit.ClientID,
					"client_secret": req.Social.Reddit.ClientSecret,
					"username":      req.Social.Reddit.Username,
					"password":      req.Social.Reddit.Password,
					"subreddits":    req.Social.Reddit.Subreddits,
				},
				"devto": bson.M{
					"api_key": req.Social.Devto.APIKey,
				},
				"linkedin": bson.M{
					"access_token": req.Social.LinkedIn.AccessToken,
				},
				"facebook": bson.M{
					"page_id":           req.Social.Facebook.PageID,
					"page_access_token": req.Social.Facebook.PageAccessToken,
				},
				"twitter": bson.M{
					"api_key":              req.Social.Twitter.APIKey,
					"api_secret":           req.Social.Twitter.APISecret,
					"access_token":         req.Social.Twitter.AccessToken,
					"access_token_secret":  req.Social.Twitter.AccessTokenSecret,
				},
			},
			"updatedAt": time.Now(),
		},
	}

	// Only admin can change roles
	if currentUserRole == "admin" && req.Role != "" {
		update["$set"].(bson.M)["role"] = req.Role
	}

	// Update user
	result, err := database.GetCollectionFromRequest(r, "users").UpdateOne(
		context.Background(),
		bson.M{"_id": userID},
		update,
	)

	if err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func ApproveUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	result, err := database.GetCollectionFromRequest(r, "users").UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"approved": true}},
	)

	if err != nil {
		http.Error(w, "Failed to approve user", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User approved successfully",
	})
}

func UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Role string `json:"role" validate:"required,oneof=admin user"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	result, err := database.GetCollectionFromRequest(r, "users").UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"role": req.Role}},
	)

	if err != nil {
		http.Error(w, "Failed to update user role", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User role updated successfully",
	})
}

type CreateUserRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Role     string `json:"role" validate:"required,oneof=admin user"`
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if user already exists
	count, err := database.GetCollectionFromRequest(r, "users").CountDocuments(context.Background(), bson.M{"email": req.Email})
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "User with this email already exists", http.StatusConflict)
		return
	}

	// Create new user
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
		Role:     req.Role,
		Approved: true, // Admin-created users are pre-approved
	}

	// Hash password
	if err := user.HashPassword(); err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Set timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	// Insert user
	result, err := database.GetCollectionFromRequest(r, "users").InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	user.ID = result.InsertedID.(primitive.ObjectID)
	user.Password = "" // Don't send password back

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully",
		"user":    user,
	})
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Get current user from context to prevent self-deletion
	currentUser := r.Context().Value("user").(*models.User)
	if currentUser.ID == id {
		http.Error(w, "Cannot delete your own account", http.StatusBadRequest)
		return
	}

	// Delete the user
	result, err := database.GetCollectionFromRequest(r, "users").DeleteOne(
		context.Background(),
		bson.M{"_id": id},
	)

	if err != nil {
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User deleted successfully",
	})
}