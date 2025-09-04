package main

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://admin:password@localhost:27419/codersblog?authSource=admin"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	// Get the database and collection
	db := client.Database("codersblog")
	collection := db.Collection("users")

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	// Create the admin user
	adminUser := bson.M{
		"email":     "admin@example.com",
		"password":  string(hashedPassword),
		"role":      "admin",
		"name":      "Admin User",
		"approved":  true,
		"createdAt": time.Now(),
		"updatedAt": time.Now(),
	}

	// Check if admin already exists
	var existingUser bson.M
	err = collection.FindOne(ctx, bson.M{"email": "admin@example.com"}).Decode(&existingUser)
	if err == mongo.ErrNoDocuments {
		// Create new admin user
		_, err = collection.InsertOne(ctx, adminUser)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Admin user created successfully")
	} else if err == nil {
		// Update existing admin user
		_, err = collection.UpdateOne(
			ctx,
			bson.M{"email": "admin@example.com"},
			bson.M{"$set": bson.M{
				"password":  string(hashedPassword),
				"approved":  true,
				"updatedAt": time.Now(),
			}},
		)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Admin user password updated successfully")
	} else {
		log.Fatal(err)
	}

	log.Println("Email: admin@example.com")
	log.Println("Password: admin123")
}