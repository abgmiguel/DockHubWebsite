package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/models"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetCategories(w http.ResponseWriter, r *http.Request) {
	query := bson.M{}

	// Filter by type
	categoryType := r.URL.Query().Get("type")
	if categoryType != "" {
		query["type"] = categoryType
	}

	cursor, err := database.GetCollectionFromRequest(r, "categories").Find(context.Background(), query)
	if err != nil {
		http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var categories []models.Category
	if err := cursor.All(context.Background(), &categories); err != nil {
		http.Error(w, "Failed to decode categories", http.StatusInternalServerError)
		return
	}

	// If no categories exist, create a default General category for the requested type
	if len(categories) == 0 && categoryType != "" {
		// First check if a General category exists for this type
		var existingGeneral models.Category
		err := database.GetCollectionFromRequest(r, "categories").FindOne(
			context.Background(), 
			bson.M{"slug": "general", "type": categoryType},
		).Decode(&existingGeneral)
		
		if err == mongo.ErrNoDocuments {
			// Only create if it doesn't exist
			generalCategory := models.Category{
				ID:        primitive.NewObjectID(),
				Name:      "General",
				Slug:      "general",
				Type:      categoryType, // Use the requested type, not hardcoded "blog"
				CreatedAt: time.Now(),
			}
			
			// Insert into database
			_, insertErr := database.GetCollectionFromRequest(r, "categories").InsertOne(context.Background(), generalCategory)
			if insertErr == nil {
				categories = append(categories, generalCategory)
			}
		} else if err == nil {
			// Found existing general category
			categories = append(categories, existingGeneral)
		}
	}

	// Ensure we always return an array, never null
	if categories == nil {
		categories = []models.Category{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var category models.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	category.ID = primitive.NewObjectID()
	category.CreatedAt = time.Now()
	category.GenerateSlug()

	_, err := database.GetCollectionFromRequest(r, "categories").InsertOne(context.Background(), category)
	if err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}

func UpdateCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	var updateData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	result, err := database.GetCollectionFromRequest(r, "categories").UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": updateData},
	)

	if err != nil {
		http.Error(w, "Failed to update category", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Category updated successfully",
	})
}

func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	// Check if category is in use
	count, err := database.GetCollectionFromRequest(r, "posts").CountDocuments(context.Background(), bson.M{"category": id})
	if err != nil {
		http.Error(w, "Failed to check category usage", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "Category is in use", http.StatusConflict)
		return
	}

	result, err := database.GetCollectionFromRequest(r, "categories").DeleteOne(context.Background(), bson.M{"_id": id})
	if err != nil {
		http.Error(w, "Failed to delete category", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Category deleted successfully",
	})
}