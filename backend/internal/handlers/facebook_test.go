package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

// TestFacebookPageConnection tests Facebook Page API connection with real API call
func TestFacebookPageConnection(pageID, pageToken string) (bool, string) {
	if pageID == "" || pageToken == "" {
		return false, "Missing Facebook Page ID or Access Token"
	}
	
	// Test with Facebook Graph API - get page details
	client := &http.Client{Timeout: 10 * time.Second}
	url := fmt.Sprintf("https://graph.facebook.com/v18.0/%s?fields=name,id,fan_count&access_token=%s", pageID, pageToken)
	
	resp, err := client.Get(url)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()
	
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, "Failed to read response"
	}
	
	if resp.StatusCode == 200 {
		// Parse the response to get page name
		var pageData struct {
			Name     string `json:"name"`
			ID       string `json:"id"`
			FanCount int    `json:"fan_count"`
		}
		
		if err := json.Unmarshal(body, &pageData); err == nil && pageData.Name != "" {
			return true, fmt.Sprintf("Connected to Facebook Page: %s (Fans: %d)", pageData.Name, pageData.FanCount)
		}
		return true, "Facebook Page connection successful"
	}
	
	// Try to get error message from response
	var fbError struct {
		Error struct {
			Message string `json:"message"`
			Code    int    `json:"code"`
		} `json:"error"`
	}
	
	if err := json.Unmarshal(body, &fbError); err == nil && fbError.Error.Message != "" {
		return false, fmt.Sprintf("Facebook API error: %s", fbError.Error.Message)
	}
	
	return false, fmt.Sprintf("Facebook API error: HTTP %d", resp.StatusCode)
}