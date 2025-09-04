package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
	
	"github.com/coders-website/backend/internal/models"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get MongoDB URI
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://admin:password@localhost:27419/codersblog?authSource=admin"
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(ctx)

	// Ping to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	db := client.Database("codersblog")
	userCollection := db.Collection("users")

	// Check if admin already exists
	var existingUser models.User
	err = userCollection.FindOne(ctx, map[string]string{"email": "admin@codersinflow.com"}).Decode(&existingUser)
	if err == nil {
		fmt.Println("Admin user already exists!")
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create admin user
	admin := models.User{
		Name:     "Admin",
		Email:    "admin@codersinflow.com",
		Password: string(hashedPassword),
		Role:     "admin",
		Approved: true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Insert the user
	result, err := userCollection.InsertOne(ctx, admin)
	if err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	fmt.Printf("Admin user created successfully!\n")
	fmt.Printf("ID: %v\n", result.InsertedID)
	fmt.Printf("Email: admin@codersinflow.com\n")
	fmt.Printf("Password: admin123\n")
	fmt.Println("\nREMEMBER TO CHANGE THE PASSWORD AFTER FIRST LOGIN!")
}