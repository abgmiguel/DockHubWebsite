package auth

import (
	"crypto/rand"
	"encoding/base64"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TenantSecrets manages per-tenant JWT secrets
var tenantSecrets = make(map[string]string)

// GetTenantSecret returns the JWT secret for a specific tenant
func GetTenantSecret(tenantID string) string {
	// Check if we have a cached secret
	if secret, exists := tenantSecrets[tenantID]; exists {
		return secret
	}
	
	// Try to load from environment (TENANT_<ID>_JWT_SECRET)
	envKey := "TENANT_" + tenantID + "_JWT_SECRET"
	if secret := os.Getenv(envKey); secret != "" {
		tenantSecrets[tenantID] = secret
		return secret
	}
	
	// Generate a new secret for this tenant
	secret := generateSecret()
	tenantSecrets[tenantID] = secret
	
	// TODO: Save to database or secure storage
	return secret
}

// generateSecret creates a cryptographically secure random secret
func generateSecret() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// GenerateTenantToken creates a JWT token for a specific tenant
func GenerateTenantToken(tenantID string, userID string, email string, role string) (string, error) {
	secret := GetTenantSecret(tenantID)
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"tenant":  tenantID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":     time.Now().Unix(),
	})
	
	return token.SignedString([]byte(secret))
}

// ValidateTenantToken validates a JWT token for a specific tenant
func ValidateTenantToken(tokenString string, tenantID string) (*jwt.MapClaims, error) {
	secret := GetTenantSecret(tenantID)
	
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	
	if err != nil {
		return nil, err
	}
	
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Verify tenant matches
		if claimTenant, ok := claims["tenant"].(string); ok && claimTenant == tenantID {
			return &claims, nil
		}
	}
	
	return nil, jwt.ErrSignatureInvalid
}