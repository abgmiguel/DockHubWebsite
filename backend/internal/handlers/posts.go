package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/middleware"
	"github.com/coders-website/backend/internal/models"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetPosts(w http.ResponseWriter, r *http.Request) {
	query := bson.M{}
	
	// Check if user is authenticated
	_, authenticated := middleware.GetUserFromContext(r)
	if !authenticated {
		// Only show published posts for unauthenticated users
		query["published"] = true
	}

	// Filter by type
	postType := r.URL.Query().Get("type")
	if postType != "" {
		query["type"] = postType
	}

	// Filter by category
	categorySlug := r.URL.Query().Get("category")
	if categorySlug != "" {
		var category models.Category
		// Try to find category by slug and type first
		categoryQuery := bson.M{"slug": categorySlug, "type": postType}
		err := database.GetCollectionFromRequest(r, "categories").FindOne(context.Background(), categoryQuery).Decode(&category)
		
		// If not found with type, try just slug
		if err != nil && postType != "" {
			categoryQuery = bson.M{"slug": categorySlug}
			err = database.GetCollectionFromRequest(r, "categories").FindOne(context.Background(), categoryQuery).Decode(&category)
		}
		
		if err == nil {
			// Use string format for category ID (data is stored as string not ObjectID)
			query["category"] = category.ID.Hex()
			log.Printf("Category found: id=%s, slug=%s, type=%s", category.ID.Hex(), category.Slug, category.Type)
			log.Printf("Query being used: %+v", query)
		} else {
			// Log the error but don't return empty - just don't filter by category
			log.Printf("Category not found: slug=%s, type=%s, error=%v", categorySlug, postType, err)
		}
	}

	// Find posts
	cursor, err := database.GetCollectionFromRequest(r, "posts").Find(
		context.Background(),
		query,
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}),
	)
	if err != nil {
		log.Printf("Error finding posts: %v", err)
		http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var posts []models.Post
	if err := cursor.All(context.Background(), &posts); err != nil {
		log.Printf("Error decoding posts: %v", err)
		http.Error(w, "Failed to decode posts", http.StatusInternalServerError)
		return
	}
	
	log.Printf("Found %d posts with query: %+v", len(posts), query)

	// Ensure we always have an array, never null
	if posts == nil {
		posts = []models.Post{}
	}

	// Populate author and category data
	var enrichedPosts []models.PostWithAuthor
	for _, post := range posts {
		enrichedPost := models.PostWithAuthor{Post: post}

		// Get author
		var author models.User
		if err := database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"_id": post.Author}).Decode(&author); err == nil {
			enrichedPost.AuthorData = &author
		}

		// Get category
		var category models.Category
		if err := database.GetCollectionFromRequest(r, "categories").FindOne(context.Background(), bson.M{"_id": post.Category}).Decode(&category); err == nil {
			enrichedPost.CategoryData = &category
		}

		enrichedPosts = append(enrichedPosts, enrichedPost)
	}

	// Ensure we always return an array, never null
	if enrichedPosts == nil {
		enrichedPosts = []models.PostWithAuthor{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrichedPosts)
}

func GetPostBySlug(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	slug := vars["slug"]

	var post models.Post
	err := database.GetCollectionFromRequest(r, "posts").FindOne(context.Background(), bson.M{"slug": slug, "published": true}).Decode(&post)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch post", http.StatusInternalServerError)
		return
	}

	// Populate author and category
	enrichedPost := models.PostWithAuthor{Post: post}

	var author models.User
	if err := database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"_id": post.Author}).Decode(&author); err == nil {
		enrichedPost.AuthorData = &author
	}

	var category models.Category
	if err := database.GetCollectionFromRequest(r, "categories").FindOne(context.Background(), bson.M{"_id": post.Category}).Decode(&category); err == nil {
		enrichedPost.CategoryData = &category
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrichedPost)
}

func GetPostByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	log.Printf("GetPostByID called with ID string: %s", idStr)
	
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		log.Printf("Error converting ID to ObjectID: %v", err)
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}
	log.Printf("Successfully converted to ObjectID: %s", id.Hex())

	var post models.Post
	err = database.GetCollectionFromRequest(r, "posts").FindOne(context.Background(), bson.M{"_id": id}).Decode(&post)
	if err != nil {
		log.Printf("Error finding post with _id %s: %v", id.Hex(), err)
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch post", http.StatusInternalServerError)
		return
	}
	log.Printf("Successfully found post: %s", post.Title)

	// Populate author and category
	enrichedPost := models.PostWithAuthor{Post: post}

	var author models.User
	if err := database.GetCollectionFromRequest(r, "users").FindOne(context.Background(), bson.M{"_id": post.Author}).Decode(&author); err == nil {
		enrichedPost.AuthorData = &author
	}

	var category models.Category
	if err := database.GetCollectionFromRequest(r, "categories").FindOne(context.Background(), bson.M{"_id": post.Category}).Decode(&category); err == nil {
		enrichedPost.CategoryData = &category
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrichedPost)
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set metadata
	post.ID = primitive.NewObjectID()
	post.Author = user.ID
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	
	// Only generate slug if not provided
	if post.Slug == "" {
		post.GenerateSlug()
	}
	
	post.CalculateReadingTime()

	// Insert post
	_, err := database.GetCollectionFromRequest(r, "posts").InsertOne(context.Background(), post)
	if err != nil {
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func UpdatePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	var updateData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update timestamp
	updateData["updatedAt"] = time.Now()

	// Recalculate reading time if content changed
	if content, ok := updateData["content"].(string); ok {
		post := models.Post{Content: content}
		post.CalculateReadingTime()
		updateData["readingTime"] = post.ReadingTime
	}

	// Update post
	result, err := database.GetCollectionFromRequest(r, "posts").UpdateOne(
		context.Background(),
		bson.M{"_id": id},
		bson.M{"$set": updateData},
	)

	if err != nil {
		http.Error(w, "Failed to update post", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Post updated successfully",
	})
}

func DeletePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	result, err := database.GetCollectionFromRequest(r, "posts").DeleteOne(context.Background(), bson.M{"_id": id})
	if err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Post deleted successfully",
	})
}