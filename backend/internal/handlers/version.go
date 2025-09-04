package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"
)

var startTime = time.Now()

func GetVersion(w http.ResponseWriter, r *http.Request) {
	// Read version from file
	version, err := os.ReadFile("version.txt")
	if err != nil {
		version = []byte("unknown")
	}

	response := map[string]interface{}{
		"version": string(version),
		"uptime":  time.Since(startTime).String(),
		"started": startTime.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}