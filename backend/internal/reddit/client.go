package reddit

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	clientID     string
	clientSecret string
	username     string
	password     string
	userAgent    string
	accessToken  string
	tokenExpiry  time.Time
	httpClient   *http.Client
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
}

type PostResponse struct {
	JSON struct {
		Errors [][]string `json:"errors"`
		Data   struct {
			URL string `json:"url"`
			ID  string `json:"id"`
		} `json:"data"`
	} `json:"json"`
}

// NewClient creates a new Reddit API client
func NewClient(clientID, clientSecret, username, password string) *Client {
	return &Client{
		clientID:     clientID,
		clientSecret: clientSecret,
		username:     username,
		password:     password,
		userAgent:    "CodersinFlow:v1.0.0 (by /u/" + username + ")",
		httpClient:   &http.Client{Timeout: 30 * time.Second},
	}
}

// authenticate gets an access token from Reddit
func (c *Client) authenticate() error {
	// Check if we have a valid token
	if c.accessToken != "" && time.Now().Before(c.tokenExpiry) {
		return nil
	}

	// Prepare the request
	data := url.Values{}
	data.Set("grant_type", "password")
	data.Set("username", c.username)
	data.Set("password", c.password)

	req, err := http.NewRequest("POST", "https://www.reddit.com/api/v1/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return fmt.Errorf("failed to create auth request: %w", err)
	}

	// Set headers
	req.SetBasicAuth(c.clientID, c.clientSecret)
	req.Header.Set("User-Agent", c.userAgent)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Send request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("auth request failed: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read auth response: %w", err)
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("auth failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return fmt.Errorf("failed to parse token response: %w", err)
	}

	// Store the token
	c.accessToken = tokenResp.AccessToken
	c.tokenExpiry = time.Now().Add(time.Duration(tokenResp.ExpiresIn-60) * time.Second) // Subtract 60 seconds for safety

	fmt.Printf("Reddit auth successful, token expires at: %v\n", c.tokenExpiry)
	return nil
}

// PostToSubreddit submits a post to a subreddit
func (c *Client) PostToSubreddit(subreddit, title, postURL string, selfText string) (string, error) {
	// Authenticate first
	if err := c.authenticate(); err != nil {
		return "", fmt.Errorf("authentication failed: %w", err)
	}

	// Prepare the post data as form values
	formData := url.Values{}
	formData.Set("api_type", "json")
	formData.Set("sr", subreddit)
	formData.Set("title", title)
	
	// If URL is provided, make it a link post
	if postURL != "" {
		formData.Set("kind", "link")
		formData.Set("url", postURL)
	} else {
		// Otherwise make it a self post with text
		formData.Set("kind", "self")
		formData.Set("text", selfText)
	}

	// Create the request with form-encoded data
	req, err := http.NewRequest("POST", "https://oauth.reddit.com/api/submit", strings.NewReader(formData.Encode()))
	if err != nil {
		return "", fmt.Errorf("failed to create post request: %w", err)
	}

	// Set headers
	req.Header.Set("User-Agent", c.userAgent)
	req.Header.Set("Authorization", "Bearer "+c.accessToken)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Send the request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("post request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read the response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read post response: %w", err)
	}

	fmt.Printf("Reddit API response: %s\n", string(body))

	// Parse the response
	var postResp PostResponse
	if err := json.Unmarshal(body, &postResp); err != nil {
		return "", fmt.Errorf("failed to parse post response: %w", err)
	}

	// Check for errors
	if len(postResp.JSON.Errors) > 0 {
		var errorMessages []string
		for _, err := range postResp.JSON.Errors {
			if len(err) > 1 {
				errorMessages = append(errorMessages, strings.Join(err, ": "))
			}
		}
		return "", fmt.Errorf("Reddit API errors: %s", strings.Join(errorMessages, ", "))
	}

	// Return the post URL
	if postResp.JSON.Data.URL != "" {
		return postResp.JSON.Data.URL, nil
	}

	// If no URL, construct it from the ID
	if postResp.JSON.Data.ID != "" {
		return fmt.Sprintf("https://reddit.com/r/%s/comments/%s", subreddit, postResp.JSON.Data.ID), nil
	}

	return "", fmt.Errorf("post was created but no URL returned")
}