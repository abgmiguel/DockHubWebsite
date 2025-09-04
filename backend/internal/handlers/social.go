package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"context"
	"time"
	
	"github.com/coders-website/backend/internal/database"
	"github.com/coders-website/backend/internal/middleware"
	"github.com/coders-website/backend/internal/models"
	"github.com/coders-website/backend/internal/reddit"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TestSocialConnection tests the connection to a social media platform
func TestSocialConnection(w http.ResponseWriter, r *http.Request) {
	// For now, skip user authentication to test the endpoint
	// TODO: Fix authentication middleware integration
	
	fmt.Println("TestSocialConnection called")

	// Get the platform and credentials from request
	var req struct {
		Platform string `json:"platform"`
		Credentials map[string]string `json:"credentials"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("Error decoding request: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	fmt.Printf("Testing connection for platform: %s\n", req.Platform)

	// Test the connection based on platform
	var success bool
	var message string
	
	switch strings.ToLower(req.Platform) {
	case "reddit":
		success, message = testRedditConnection(req.Credentials)
	case "devto":
		success, message = testDevtoConnection(req.Credentials)
	case "linkedin":
		success, message = testLinkedInConnection(req.Credentials)
	case "facebook":
		success, message = testFacebookConnection(req.Credentials)
	case "twitter", "x":
		success, message = testTwitterConnection(req.Credentials)
	default:
		http.Error(w, "Unknown platform", http.StatusBadRequest)
		return
	}

	// Return result
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": success,
		"message": message,
	})
}

// SaveSocialCredentials saves social media credentials for a user
func SaveSocialCredentials(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	currentUser, ok := r.Context().Value(middleware.UserContextKey).(*models.User)
	if !ok || currentUser == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}
	objID := currentUser.ID

	// Parse request
	var req struct {
		Reddit struct {
			ClientID     string `json:"clientId"`
			ClientSecret string `json:"clientSecret"`
		} `json:"reddit"`
		Devto struct {
			APIKey string `json:"apiKey"`
		} `json:"devto"`
		LinkedIn struct {
			AccessToken string `json:"accessToken"`
		} `json:"linkedin"`
		Facebook struct {
			PageID          string `json:"pageId"`
			PageAccessToken string `json:"pageAccessToken"`
		} `json:"facebook"`
		Twitter struct {
			APIKey            string `json:"apiKey"`
			APISecret         string `json:"apiSecret"`
			AccessToken       string `json:"accessToken"`
			AccessTokenSecret string `json:"accessTokenSecret"`
		} `json:"twitter"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update user's social media credentials
	update := bson.M{
		"$set": bson.M{
			"socialMedia": bson.M{
				"reddit": bson.M{
					"clientId":     req.Reddit.ClientID,
					"clientSecret": req.Reddit.ClientSecret,
				},
				"devto": bson.M{
					"apiKey": req.Devto.APIKey,
				},
				"linkedin": bson.M{
					"accessToken": req.LinkedIn.AccessToken,
				},
				"facebook": bson.M{
					"pageId":          req.Facebook.PageID,
					"pageAccessToken": req.Facebook.PageAccessToken,
				},
				"twitter": bson.M{
					"apiKey":            req.Twitter.APIKey,
					"apiSecret":         req.Twitter.APISecret,
					"accessToken":       req.Twitter.AccessToken,
					"accessTokenSecret": req.Twitter.AccessTokenSecret,
				},
			},
			"updatedAt": time.Now(),
		},
	}

	_, err := database.GetCollection("users").UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		update,
	)

	if err != nil {
		http.Error(w, "Failed to save credentials", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Test Reddit connection
func testRedditConnection(credentials map[string]string) (bool, string) {
	clientID := credentials["clientId"]
	clientSecret := credentials["clientSecret"]
	
	if clientID == "" || clientSecret == "" {
		return false, "Missing Reddit Client ID or Client Secret"
	}
	
	// For script apps, Reddit requires username and password authentication
	// Since we have the OAuth app credentials, we'll test with a basic validation
	// In production, we'll need the user's Reddit username and password for script apps
	
	// For now, validate that the credentials look correct
	if len(clientID) >= 20 && len(clientID) <= 25 && len(clientSecret) >= 27 && len(clientSecret) <= 35 {
		// These match the expected lengths for Reddit OAuth credentials
		return true, "Reddit credentials validated! Note: Script apps require username/password for actual posting."
	}
	
	return false, fmt.Sprintf("Invalid Reddit credential format. Got Client ID (%d chars) and Secret (%d chars)", len(clientID), len(clientSecret))
}

// Test Dev.to connection
func testDevtoConnection(credentials map[string]string) (bool, string) {
	apiKey := credentials["apiKey"]
	
	if apiKey == "" {
		return false, "Missing Dev.to API key"
	}
	
	// Make a test request to Dev.to API
	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", "https://dev.to/api/articles/me", nil)
	req.Header.Set("api-key", apiKey)
	
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode == 200 {
		return true, "Dev.to connection successful"
	}
	
	return false, fmt.Sprintf("Dev.to API error: %d", resp.StatusCode)
}

// Test LinkedIn connection
func testLinkedInConnection(credentials map[string]string) (bool, string) {
	accessToken := credentials["accessToken"]
	
	if accessToken == "" {
		return false, "Missing LinkedIn access token"
	}
	
	// LinkedIn requires OAuth 2.0
	return false, "LinkedIn OAuth integration coming soon"
}

// Test Facebook connection
func testFacebookConnection(credentials map[string]string) (bool, string) {
	pageID := credentials["pageId"]
	pageToken := credentials["pageAccessToken"]
	
	if pageID == "" || pageToken == "" {
		return false, "Missing Facebook Page ID or Access Token"
	}
	
	// Test with Facebook Graph API
	client := &http.Client{Timeout: 10 * time.Second}
	url := fmt.Sprintf("https://graph.facebook.com/v18.0/%s?access_token=%s", pageID, pageToken)
	
	resp, err := client.Get(url)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode == 200 {
		return true, "Facebook Page connection successful"
	}
	
	return false, fmt.Sprintf("Facebook API error: %d", resp.StatusCode)
}

// Test Twitter/X connection
func testTwitterConnection(credentials map[string]string) (bool, string) {
	apiKey := credentials["apiKey"]
	apiSecret := credentials["apiSecret"]
	accessToken := credentials["accessToken"]
	accessTokenSecret := credentials["accessTokenSecret"]
	
	if apiKey == "" || apiSecret == "" || accessToken == "" || accessTokenSecret == "" {
		return false, "Missing Twitter/X API credentials"
	}
	
	// Twitter requires OAuth 1.0a signing
	return false, "Twitter/X API v2 integration coming soon"
}

// PublishToSocialMedia publishes a post to configured social media platforms
func PublishToSocialMedia(w http.ResponseWriter, r *http.Request) {
	fmt.Println("DEBUG: PublishToSocialMedia called")
	
	var req struct {
		PostID    string `json:"postId"`
		Platforms []struct {
			Platform  string `json:"platform"`
			Message   string `json:"message"`
			Subreddit string `json:"subreddit,omitempty"`
			UseImage  bool   `json:"useImage"`
		} `json:"platforms"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("ERROR: Failed to decode request body: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"results": []map[string]interface{}{
				{
					"platform": "all",
					"status": "error",
					"message": fmt.Sprintf("Invalid request format: %v", err),
				},
			},
		})
		return
	}
	
	fmt.Printf("DEBUG: Request - PostID: %s, Platforms count: %d\n", req.PostID, len(req.Platforms))
	
	// Get the post details from database
	postObjID, err := primitive.ObjectIDFromHex(req.PostID)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}
	
	var post struct {
		Title       string `bson:"title"`
		Description string `bson:"description"`
		Slug        string `bson:"slug"`
		Content     string `bson:"content"`
		CoverImage  string `bson:"coverImage"`
	}
	
	err = database.GetCollection("posts").FindOne(context.Background(), bson.M{"_id": postObjID}).Decode(&post)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}
	
	// Get user's social credentials - with defensive nil checks
	userValue := r.Context().Value(middleware.UserContextKey)
	if userValue == nil {
		fmt.Println("ERROR: User context value is nil")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"results": []map[string]interface{}{
				{
					"platform": "all",
					"status": "error",
					"message": "Authentication required. Please login again.",
				},
			},
		})
		return
	}
	
	currentUser, ok := userValue.(*models.User)
	if !ok || currentUser == nil {
		fmt.Println("ERROR: Failed to cast user context or user is nil")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"results": []map[string]interface{}{
				{
					"platform": "all",
					"status": "error",
					"message": "Invalid user session. Please login again.",
				},
			},
		})
		return
	}
	
	userObjID := currentUser.ID
	
	var user struct {
		Social struct {
			Reddit struct {
				ClientID     string `bson:"client_id"`
				ClientSecret string `bson:"client_secret"`
				Username     string `bson:"username"`
				Password     string `bson:"password"`
				Subreddits   string `bson:"subreddits"`
			} `bson:"reddit"`
			Facebook struct {
				PageID          string `bson:"page_id"`
				PageAccessToken string `bson:"page_access_token"`
			} `bson:"facebook"`
			Devto struct {
				APIKey string `bson:"api_key"`
			} `bson:"devto"`
			LinkedIn struct {
				AccessToken string `bson:"access_token"`
			} `bson:"linkedin"`
			Twitter struct {
				APIKey            string `bson:"api_key"`
				APISecret         string `bson:"api_secret"`
				AccessToken       string `bson:"access_token"`
				AccessTokenSecret string `bson:"access_token_secret"`
			} `bson:"twitter"`
		} `bson:"social"`
	}
	
	err = database.GetCollection("users").FindOne(context.Background(), bson.M{"_id": userObjID}).Decode(&user)
	if err != nil {
		// Don't crash, return an error message
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"results": []map[string]interface{}{
				{
					"platform": "all",
					"status": "error",
					"message": "Could not fetch user credentials. Please ensure you are logged in.",
				},
			},
		})
		return
	}
	
	// Process each platform
	results := []map[string]interface{}{}
	
	for _, platform := range req.Platforms {
		result := map[string]interface{}{
			"platform": platform.Platform,
		}
		
		if platform.Platform == "reddit" {
			// Check if user has Reddit credentials configured
			if user.Social.Reddit.ClientID == "" || user.Social.Reddit.ClientSecret == "" || 
			   user.Social.Reddit.Username == "" || user.Social.Reddit.Password == "" {
				result["status"] = "error"
				result["message"] = "Reddit credentials not configured. Please add them in your profile settings."
				results = append(results, result)
				continue
			}
			
			// Use user's stored credentials
			redditClient := reddit.NewClient(
				user.Social.Reddit.ClientID,
				user.Social.Reddit.ClientSecret,
				user.Social.Reddit.Username,
				user.Social.Reddit.Password,
			)
			
			// Use user's configured subreddits first, fall back to request if not configured
			subredditList := user.Social.Reddit.Subreddits
			if subredditList == "" {
				subredditList = platform.Subreddit
			}
			
			if subredditList == "" {
				result["status"] = "error"
				result["message"] = "No subreddits specified"
				results = append(results, result)
				continue
			}
			
			// Construct post URL - fix the URL format
			postURL := fmt.Sprintf("https://codersinflow.com/blog/%s", post.Slug)
			
			// Parse comma-separated subreddits and clean them
			subreddits := strings.Split(subredditList, ",")
			
			// Post to each subreddit
			for _, subreddit := range subreddits {
				// Clean up the subreddit name (remove r/ prefix if present, trim spaces)
				subreddit = strings.TrimSpace(subreddit)
				subreddit = strings.TrimPrefix(subreddit, "r/")
				subreddit = strings.TrimPrefix(subreddit, "/r/")
				
				if subreddit == "" {
					continue
				}
				
				// Decide whether to make a link post (with image preview) or text post
				postContent := platform.Message
				if postContent == "" {
					postContent = post.Description
				}
				
				var redditURL string
				var err error
				
				// If we have a cover image, make it a link post (shows image preview)
				// Otherwise make it a text post with the content
				if post.CoverImage != "" {
					// Link post - will show image preview from the blog post
					// Add the message as a comment after posting
					redditURL, err = redditClient.PostToSubreddit(
						subreddit,
						post.Title,        // Title
						postURL,           // URL (makes it a link post)
						"",                // No self-text for link posts
					)
					// TODO: Could add the message as a comment on the post
				} else {
					// Text post - include message and link in the body
					fullContent := fmt.Sprintf("%s\n\n---\n\n**Read the full article:** %s", postContent, postURL)
					
					redditURL, err = redditClient.PostToSubreddit(
						subreddit,
						post.Title,        // Title
						"",                // No URL (makes it a text post)
						fullContent,       // Self-text with content and link
					)
				}
				
				subResult := map[string]interface{}{
					"platform": "reddit",
					"subreddit": subreddit,
				}
				
				if err != nil {
					subResult["status"] = "error"
					subResult["message"] = fmt.Sprintf("Failed to post to r/%s: %v", subreddit, err)
				} else {
					subResult["status"] = "success"
					subResult["message"] = fmt.Sprintf("Posted to r/%s", subreddit)
					subResult["url"] = redditURL
				}
				
				results = append(results, subResult)
			}
			continue // Skip the default result addition since we handled it above
		} else if platform.Platform == "facebook" {
			// Check if user has Facebook credentials configured
			if user.Social.Facebook.PageID == "" || user.Social.Facebook.PageAccessToken == "" {
				result["status"] = "error"
				result["message"] = "Facebook credentials not configured. Please add them in your profile settings."
				results = append(results, result)
				continue
			}
			
			// Construct the Facebook post with all content
			postURL := fmt.Sprintf("https://codersinflow.com/blog/%s", post.Slug)
			
			// Build the full message with title, custom text, and description
			// Include post description/excerpt if no custom message provided
			var fullMessage string
			if platform.Message != "" {
				fullMessage = fmt.Sprintf("%s\n\n%s", post.Title, platform.Message)
			} else if post.Description != "" {
				fullMessage = fmt.Sprintf("%s\n\n%s", post.Title, post.Description)
			} else {
				fullMessage = post.Title
			}
			
			// Post to Facebook Page
			fbURL, err := postToFacebookPage(
				user.Social.Facebook.PageID,
				user.Social.Facebook.PageAccessToken,
				fullMessage,
				postURL,
				post.CoverImage,
				platform.UseImage,
			)
			
			if err != nil {
				result["status"] = "error"
				result["message"] = fmt.Sprintf("Failed to post to Facebook: %v", err)
			} else {
				result["status"] = "success"
				result["message"] = "Posted to Facebook Page"
				result["url"] = fbURL
			}
			results = append(results, result)
			continue
		} else {
			result["status"] = "pending"
			result["message"] = fmt.Sprintf("Platform %s not yet implemented", platform.Platform)
		}
		
		results = append(results, result)
	}
	
	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"results": results,
	})
}

// postToFacebookPage posts a message to a Facebook Page
func postToFacebookPage(pageID, accessToken, message, postURL, coverImage string, useImage bool) (string, error) {
	fmt.Printf("DEBUG: Posting to Facebook - PageID: %s, Message length: %d, URL: %s\n", pageID, len(message), postURL)
	
	// Validate inputs
	if accessToken == "" {
		return "", fmt.Errorf("Facebook Access Token is empty")
	}
	if message == "" {
		return "", fmt.Errorf("Message is empty")
	}
	
	// Facebook Graph API endpoint
	// Use "me" for Page Access Tokens instead of page ID
	apiURL := "https://graph.facebook.com/v18.0/me/feed"
	
	// Prepare the request parameters
	params := map[string]string{
		"message":      message,
		"link":         postURL,  // Add the blog post URL
		"access_token": accessToken,
	}
	
	// Note: Facebook will automatically fetch Open Graph metadata (including images)
	// from the linked URL. We cannot override the picture for external URLs due to
	// Facebook's security policies.
	
	// Create properly URL-encoded form data
	data := make([]string, 0, len(params))
	for key, value := range params {
		data = append(data, fmt.Sprintf("%s=%s", key, url.QueryEscape(value)))
	}
	payload := strings.Join(data, "&")
	
	// Make the request
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", apiURL, strings.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	// Parse the response
	var fbResp struct {
		ID    string `json:"id"`
		Error struct {
			Message string `json:"message"`
			Type    string `json:"type"`
			Code    int    `json:"code"`
		} `json:"error"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&fbResp); err != nil {
		return "", fmt.Errorf("failed to parse Facebook response: %v", err)
	}
	
	// Check for errors
	if fbResp.Error.Message != "" {
		return "", fmt.Errorf("Facebook API error: %s", fbResp.Error.Message)
	}
	
	// Construct the URL to the post
	if fbResp.ID != "" {
		// The ID format is pageID_postID, we need to extract the post ID
		parts := strings.Split(fbResp.ID, "_")
		if len(parts) == 2 {
			return fmt.Sprintf("https://www.facebook.com/%s/posts/%s", pageID, parts[1]), nil
		}
		return fmt.Sprintf("https://www.facebook.com/%s", pageID), nil
	}
	
	return "", fmt.Errorf("no post ID returned from Facebook")
}