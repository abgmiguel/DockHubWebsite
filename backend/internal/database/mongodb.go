package database

import (
	"context"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client   *mongo.Client
	database *mongo.Database
)

func Connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://admin:password@localhost:27017/codersblog?authSource=admin"
	}
	log.Printf("Connecting to MongoDB: %s", uri)

	clientOptions := options.Client().ApplyURI(uri)
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	// Ping the database
	if err = client.Ping(ctx, nil); err != nil {
		return err
	}

	// Extract database name from URI
	parsedURI, _ := url.Parse(uri)
	dbName := strings.TrimPrefix(parsedURI.Path, "/")
	if idx := strings.Index(dbName, "?"); idx != -1 {
		dbName = dbName[:idx]
	}
	if dbName == "" {
		dbName = "codersblog" // fallback
	}
	
	database = client.Database(dbName)
	log.Printf("Connected to MongoDB! Using database: %s", dbName)
	return nil
}

func Disconnect() {
	if client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			log.Println("Error disconnecting from MongoDB:", err)
		}
	}
}

func GetDB() *mongo.Database {
	return database
}

func GetCollection(name string) *mongo.Collection {
	return database.Collection(name)
}