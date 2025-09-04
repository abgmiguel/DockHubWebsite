package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/models"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type SiteConfig struct {
	Admin struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	} `json:"admin"`
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Read site.config.json
	configFile := "/app/site.config.json"
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		// Try alternate location
		configFile = "site.config.json"
	}

	data, err := os.ReadFile(configFile)
	if err != nil {
		log.Printf("Could not read site.config.json: %v", err)
		// Fall back to environment variables
		createFromEnv()
		return
	}

	var config SiteConfig
	if err := json.Unmarshal(data, &config); err != nil {
		log.Fatalf("Failed to parse site.config.json: %v", err)
	}

	if config.Admin.Email == "" || config.Admin.Password == "" {
		log.Println("Admin credentials not found in config, checking environment variables")
		createFromEnv()
		return
	}

	// Connect to MongoDB
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Disconnect()

	// Create or update admin user
	if err := createOrUpdateAdmin(config.Admin.Email, config.Admin.Password, config.Admin.Name); err != nil {
		log.Fatalf("Failed to create/update admin: %v", err)
	}

	log.Printf("Admin user '%s' created/updated successfully", config.Admin.Email)
}

func createFromEnv() {
	email := os.Getenv("ADMIN_EMAIL")
	password := os.Getenv("ADMIN_PASSWORD")
	name := os.Getenv("ADMIN_NAME")

	if email == "" || password == "" {
		log.Println("No admin credentials provided in config or environment")
		return
	}

	if name == "" {
		name = "Admin"
	}

	// Connect to MongoDB
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Disconnect()

	if err := createOrUpdateAdmin(email, password, name); err != nil {
		log.Fatalf("Failed to create/update admin: %v", err)
	}

	log.Printf("Admin user '%s' created/updated successfully", email)
}

func createOrUpdateAdmin(email, password, name string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}

	collection := database.GetCollection("users")

	// Check if user exists
	var existingUser models.User
	err = collection.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)

	if err == mongo.ErrNoDocuments {
		// Create new admin user
		newUser := models.User{
			Name:      name,
			Email:     email,
			Password:  string(hashedPassword),
			Role:      "admin",
			Approved:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		_, err = collection.InsertOne(ctx, newUser)
		if err != nil {
			return fmt.Errorf("failed to create admin user: %v", err)
		}
		log.Println("New admin user created")
	} else if err == nil {
		// Update existing user
		update := bson.M{
			"$set": bson.M{
				"password":  string(hashedPassword),
				"role":      "admin",
				"approved":  true,
				"updatedAt": time.Now(),
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"email": email}, update)
		if err != nil {
			return fmt.Errorf("failed to update admin user: %v", err)
		}
		log.Println("Existing admin user updated")
	} else {
		return fmt.Errorf("failed to check for existing user: %v", err)
	}

	return nil
}