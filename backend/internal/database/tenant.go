package database

import (
	"net/http"
	"sync"

	"go.mongodb.org/mongo-driver/mongo"
)

var (
	tenantDBs = make(map[string]*mongo.Database)
	dbMutex   sync.RWMutex
)

// GetTenantDB returns a database connection for the specified tenant
func GetTenantDB(tenantDB string) *mongo.Database {
	if tenantDB == "" {
		tenantDB = "coders_website"
	}
	
	// Check if we already have this database
	dbMutex.RLock()
	if db, exists := tenantDBs[tenantDB]; exists {
		dbMutex.RUnlock()
		return db
	}
	dbMutex.RUnlock()
	
	// Create new database reference
	dbMutex.Lock()
	defer dbMutex.Unlock()
	
	// Double-check after acquiring write lock
	if db, exists := tenantDBs[tenantDB]; exists {
		return db
	}
	
	// Create new database reference
	db := client.Database(tenantDB)
	tenantDBs[tenantDB] = db
	
	return db
}

// GetTenantCollection returns a collection for the specified tenant
func GetTenantCollection(tenantDB string, collectionName string) *mongo.Collection {
	db := GetTenantDB(tenantDB)
	return db.Collection(collectionName)
}

// GetDBFromRequest extracts the tenant database from the request context
func GetDBFromRequest(r *http.Request) *mongo.Database {
	if tenantDB, ok := r.Context().Value("tenant_database").(string); ok {
		return GetTenantDB(tenantDB)
	}
	return GetDB() // fallback to default
}

// GetCollectionFromRequest returns a collection for the tenant from request context
func GetCollectionFromRequest(r *http.Request, collectionName string) *mongo.Collection {
	db := GetDBFromRequest(r)
	return db.Collection(collectionName)
}