package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// GetComponentData retrieves JSON data for a component
func GetComponentData(w http.ResponseWriter, r *http.Request) {
	// Get query parameters
	componentPath := r.URL.Query().Get("path")
	site := r.URL.Query().Get("site")

	if componentPath == "" || site == "" {
		http.Error(w, "Missing required parameters: path and site", http.StatusBadRequest)
		return
	}

	// Sanitize inputs to prevent directory traversal
	componentPath = filepath.Base(componentPath)
	site = strings.ReplaceAll(site, "/", "")
	site = strings.ReplaceAll(site, "..", "")

	// Construct file path
	// Assuming the Go server runs from the backend directory
	dataPath := filepath.Join("..", "astro-multi-tenant", "src", "sites", site, "data", componentPath)

	// Read the file
	data, err := ioutil.ReadFile(dataPath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, fmt.Sprintf("Component data not found: %s", componentPath), http.StatusNotFound)
		} else {
			http.Error(w, fmt.Sprintf("Error reading component data: %v", err), http.StatusInternalServerError)
		}
		return
	}

	// Validate JSON
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		http.Error(w, "Invalid JSON in component file", http.StatusInternalServerError)
		return
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

// UpdateComponentData updates JSON data for a component
func UpdateComponentData(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req struct {
		Path string          `json:"path"`
		Site string          `json:"site"`
		Data json.RawMessage `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Path == "" || req.Site == "" || len(req.Data) == 0 {
		http.Error(w, "Missing required fields: path, site, and data", http.StatusBadRequest)
		return
	}

	// Sanitize inputs
	req.Path = filepath.Base(req.Path)
	req.Site = strings.ReplaceAll(req.Site, "/", "")
	req.Site = strings.ReplaceAll(req.Site, "..", "")

	// Validate JSON
	var jsonData interface{}
	if err := json.Unmarshal(req.Data, &jsonData); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	// Pretty print the JSON
	prettyJSON, err := json.MarshalIndent(jsonData, "", "  ")
	if err != nil {
		http.Error(w, "Error formatting JSON", http.StatusInternalServerError)
		return
	}

	// Construct file path
	dataPath := filepath.Join("..", "astro-multi-tenant", "src", "sites", req.Site, "data", req.Path)

	// Create backup of existing file (optional)
	if _, err := os.Stat(dataPath); err == nil {
		backupPath := dataPath + ".backup"
		if data, err := ioutil.ReadFile(dataPath); err == nil {
			ioutil.WriteFile(backupPath, data, 0644)
		}
	}

	// Write the updated data
	if err := ioutil.WriteFile(dataPath, prettyJSON, 0644); err != nil {
		http.Error(w, fmt.Sprintf("Error writing component data: %v", err), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "Component data updated successfully",
	})
}

// ListComponentData lists all available component data files for a site
func ListComponentData(w http.ResponseWriter, r *http.Request) {
	site := r.URL.Query().Get("site")
	
	if site == "" {
		http.Error(w, "Missing required parameter: site", http.StatusBadRequest)
		return
	}

	// Sanitize site input
	site = strings.ReplaceAll(site, "/", "")
	site = strings.ReplaceAll(site, "..", "")

	// Construct directory path
	dataDir := filepath.Join("..", "astro-multi-tenant", "src", "sites", site, "data")

	// Read directory
	files, err := ioutil.ReadDir(dataDir)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Site data directory not found", http.StatusNotFound)
		} else {
			http.Error(w, fmt.Sprintf("Error reading data directory: %v", err), http.StatusInternalServerError)
		}
		return
	}

	// Filter for JSON files
	var jsonFiles []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".json") {
			jsonFiles = append(jsonFiles, file.Name())
		}
	}

	// Return the list
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"site": site,
		"components": jsonFiles,
	})
}

// ReorderComponents handles reordering of components in an Astro page
func ReorderComponents(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req struct {
		Site      string `json:"site"`
		Component1 struct {
			Name  string `json:"name"`
			Order int    `json:"order"`
		} `json:"component1"`
		Component2 struct {
			Name  string `json:"name"`
			Order int    `json:"order"`
		} `json:"component2"`
		PagePath string `json:"pagePath"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Sanitize inputs
	req.Site = strings.ReplaceAll(req.Site, "/", "")
	req.Site = strings.ReplaceAll(req.Site, "..", "")

	// Determine which file to modify based on pagePath
	pagePath := "index.astro" // default
	if req.PagePath != "/" && req.PagePath != "" {
		// Convert URL path to file path
		pagePath = strings.TrimPrefix(req.PagePath, "/")
		if !strings.HasSuffix(pagePath, ".astro") {
			pagePath = filepath.Join(pagePath, "index.astro")
		}
	}

	// Construct file path
	astroPath := filepath.Join("..", "astro-multi-tenant", "src", "sites", req.Site, "pages", pagePath)

	// Read the file
	content, err := ioutil.ReadFile(astroPath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error reading page file: %v", err), http.StatusInternalServerError)
		return
	}

	// Convert to string and ensure we preserve the exact structure
	fileContent := string(content)
	
	// Find and swap the components - use \n to split properly
	lines := strings.Split(fileContent, "\n")
	comp1Line := -1
	comp2Line := -1
	
	// Find component lines - look for the actual component tags
	// Skip the frontmatter section (between --- markers)
	inFrontmatter := false
	frontmatterCount := 0
	
	for i, line := range lines {
		// Track frontmatter section
		if strings.TrimSpace(line) == "---" {
			frontmatterCount++
			if frontmatterCount == 1 {
				inFrontmatter = true
			} else if frontmatterCount == 2 {
				inFrontmatter = false
			}
			continue
		}
		
		// Skip lines in frontmatter (imports, etc.)
		if inFrontmatter {
			continue
		}
		
		// Look for opening component tags with more precise matching
		trimmedLine := strings.TrimSpace(line)
		if (strings.HasPrefix(trimmedLine, fmt.Sprintf("<%s ", req.Component1.Name)) ||
		    strings.HasPrefix(trimmedLine, fmt.Sprintf("<%s>", req.Component1.Name)) ||
		    trimmedLine == fmt.Sprintf("<%s />", req.Component1.Name)) {
			if comp1Line == -1 {
				comp1Line = i
			}
		}
		if (strings.HasPrefix(trimmedLine, fmt.Sprintf("<%s ", req.Component2.Name)) ||
		    strings.HasPrefix(trimmedLine, fmt.Sprintf("<%s>", req.Component2.Name)) ||
		    trimmedLine == fmt.Sprintf("<%s />", req.Component2.Name)) {
			if comp2Line == -1 {
				comp2Line = i
			}
		}
	}

	// If we found both components, just swap the lines
	if comp1Line != -1 && comp2Line != -1 {
		// Simple line swap for self-closing components
		lines[comp1Line], lines[comp2Line] = lines[comp2Line], lines[comp1Line]
		
		// Write back with proper line endings
		newContent := strings.Join(lines, "\n")
		
		// Ensure file ends with a newline if the original did
		if len(content) > 0 && content[len(content)-1] == '\n' && !strings.HasSuffix(newContent, "\n") {
			newContent += "\n"
		}
		
		if err := ioutil.WriteFile(astroPath, []byte(newContent), 0644); err != nil {
			http.Error(w, fmt.Sprintf("Error writing updated page: %v", err), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "success",
			"message": "Components reordered successfully",
		})
		return
	}
	
	// Original complex logic for DevWrapper components (keep as fallback)
	if false {
		// Find the complete component blocks (from <DevWrapper to </DevWrapper>)
		comp1Start := comp1Line
		comp1End := comp1Line
		comp2Start := comp2Line
		comp2End := comp2Line

		// Find end of first component
		for i := comp1Line; i < len(lines); i++ {
			if strings.Contains(lines[i], "</DevWrapper>") {
				comp1End = i
				break
			}
		}

		// Find end of second component
		for i := comp2Line; i < len(lines); i++ {
			if strings.Contains(lines[i], "</DevWrapper>") {
				comp2End = i
				break
			}
		}

		// Extract component blocks
		comp1Block := lines[comp1Start:comp1End+1]
		comp2Block := lines[comp2Start:comp2End+1]

		// Update order attributes in the blocks
		for i := range comp1Block {
			comp1Block[i] = regexp.MustCompile(`order=\{\d+\}`).ReplaceAllString(
				comp1Block[i], fmt.Sprintf(`order={%d}`, req.Component2.Order))
		}
		for i := range comp2Block {
			comp2Block[i] = regexp.MustCompile(`order=\{\d+\}`).ReplaceAllString(
				comp2Block[i], fmt.Sprintf(`order={%d}`, req.Component1.Order))
		}

		// Reconstruct the file with swapped components
		var newLines []string
		
		if comp1Start < comp2Start {
			// Component 1 comes before Component 2
			newLines = append(newLines, lines[:comp1Start]...)
			newLines = append(newLines, comp2Block...)
			newLines = append(newLines, lines[comp1End+1:comp2Start]...)
			newLines = append(newLines, comp1Block...)
			newLines = append(newLines, lines[comp2End+1:]...)
		} else {
			// Component 2 comes before Component 1
			newLines = append(newLines, lines[:comp2Start]...)
			newLines = append(newLines, comp1Block...)
			newLines = append(newLines, lines[comp2End+1:comp1Start]...)
			newLines = append(newLines, comp2Block...)
			newLines = append(newLines, lines[comp1End+1:]...)
		}

		// Write the updated content back
		newContent := strings.Join(newLines, "\n")
		if err := ioutil.WriteFile(astroPath, []byte(newContent), 0644); err != nil {
			http.Error(w, fmt.Sprintf("Error writing updated page: %v", err), http.StatusInternalServerError)
			return
		}

		// Return success
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "success",
			"message": "Components reordered successfully",
		})
	} else {
		// Try a simpler approach - just look for the component names without DevWrapper
		// This handles components that might not be wrapped yet
		comp1Pattern := fmt.Sprintf("<%s\\s", req.Component1.Name)
		comp2Pattern := fmt.Sprintf("<%s\\s", req.Component2.Name)
		
		comp1Line = -1
		comp2Line = -1
		
		for i, line := range lines {
			if strings.Contains(line, comp1Pattern) || strings.Contains(line, req.Component1.Name + " ") {
				if comp1Line == -1 {
					comp1Line = i
				}
			}
			if strings.Contains(line, comp2Pattern) || strings.Contains(line, req.Component2.Name + " ") {
				if comp2Line == -1 {
					comp2Line = i
				}
			}
		}
		
		if comp1Line != -1 && comp2Line != -1 {
			// Simple line swap
			lines[comp1Line], lines[comp2Line] = lines[comp2Line], lines[comp1Line]
			
			// Write back
			newContent := strings.Join(lines, "\n")
			if err := ioutil.WriteFile(astroPath, []byte(newContent), 0644); err != nil {
				http.Error(w, fmt.Sprintf("Error writing updated page: %v", err), http.StatusInternalServerError)
				return
			}
			
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{
				"status": "success",
				"message": "Components reordered successfully",
			})
		} else {
			http.Error(w, "Could not find components to reorder", http.StatusBadRequest)
		}
	}
}