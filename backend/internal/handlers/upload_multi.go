package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/coders-website/backend/internal/middleware"
)

// UploadFileMultiTenant handles file uploads with tenant isolation
func UploadFileMultiTenant(w http.ResponseWriter, r *http.Request) {
	// Get tenant info from context
	tenantID := middleware.GetTenantID(r)
	if tenantID == "" {
		tenantID = "default"
	}

	// Parse multipart form (10MB max)
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	allowedTypes := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
		".pdf": true, ".doc": true, ".docx": true,
	}

	ext := strings.ToLower(filepath.Ext(handler.Filename))
	if !allowedTypes[ext] {
		http.Error(w, "File type not allowed", http.StatusBadRequest)
		return
	}

	// Create tenant-specific upload directory
	uploadDir := filepath.Join("uploads", tenantID, time.Now().Format("2006/01"))
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		http.Error(w, "Failed to create upload directory", http.StatusInternalServerError)
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, handler.Filename)
	filepath := filepath.Join(uploadDir, filename)

	// Create file
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy file contents
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// Return file URL (relative to tenant)
	fileURL := fmt.Sprintf("/uploads/%s/%s/%s", tenantID, time.Now().Format("2006/01"), filename)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"url": "%s", "filename": "%s"}`, fileURL, handler.Filename)
}