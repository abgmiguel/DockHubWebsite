# Social Media Integration Setup Guide

This guide helps you set up social media integration for automatic cross-posting of blog posts.

## Overview

The blog platform supports publishing to:
- Reddit
- Dev.to
- LinkedIn
- Facebook Pages
- X (Twitter)

## Platform Setup Instructions

### Reddit

1. **Create Reddit App**
   - Go to https://www.reddit.com/prefs/apps
   - Click "Create Another App"
   - Choose "script" as the app type
   - Set redirect URI to `http://localhost:3000/callback` (for development)

2. **Get Credentials**
   - **Client ID**: Found under your app name (random string)
   - **Client Secret**: Click "edit" on your app to view

3. **Required Permissions**
   - Your Reddit account needs karma and age requirements for posting
   - Some subreddits have additional requirements

### Dev.to

1. **Generate API Key**
   - Go to https://dev.to/settings/extensions
   - Scroll to "DEV API Keys"
   - Generate a new API key
   - Give it a descriptive name like "Blog Publisher"

2. **Usage Limits**
   - 30 requests per 30 seconds
   - Articles are published immediately

### LinkedIn

1. **Create LinkedIn App**
   - Go to https://www.linkedin.com/developers
   - Click "Create app"
   - Fill in required information
   - Verify your app

2. **Configure OAuth 2.0**
   - Add redirect URLs
   - Request `w_member_social` permission
   - Generate access token (expires every 60 days)

3. **Get Credentials**
   - **Client ID**: In app credentials
   - **Client Secret**: In app credentials
   - **Access Token**: Generate from OAuth flow

### Facebook

1. **Create Facebook App**
   - Go to https://developers.facebook.com
   - Click "Create App"
   - Choose "Business" type

2. **Configure Facebook Login**
   - Add Facebook Login product
   - Set OAuth redirect URIs

3. **Get Page Access Token**
   - Use Graph API Explorer
   - Request permissions: `pages_manage_posts`, `pages_read_engagement`
   - Get Page Access Token (not User Access Token)

4. **Get Page ID**
   - Go to your Facebook Page
   - Click "About"
   - Find Page ID at the bottom

### X (Twitter)

1. **Apply for Developer Account**
   - Go to https://developer.twitter.com
   - Apply for Elevated access (for v2 API)

2. **Create Project and App**
   - Create a new project
   - Create an app within the project
   - Enable OAuth 2.0

3. **Get Credentials**
   - **API Key**: In app keys
   - **API Secret**: In app keys
   - **Bearer Token**: Generate in app keys
   - **Access Token & Secret**: Generate in app keys

## Environment Variables

Add to your `.env` file:

```env
# Encryption key for storing credentials (32 bytes)
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Optional: OAuth callback URL
OAUTH_CALLBACK_URL=https://yourdomain.com/api/social/callback
```

## Database Setup

Run the migration to add social media tables:

```sql
psql -U your_user -d your_database -f backend/migrations/003_social_integration.sql
```

## Testing Integration

1. **Configure Credentials**
   - Log into the editor
   - Go to Users → Edit your profile
   - Add API credentials for each platform
   - Click "Test Connection" for each

2. **Publish Test Post**
   - Create a test post
   - Publish it to your blog
   - Click "Publish to Social"
   - Select platforms
   - Customize messages
   - Click Publish

## Rate Limits

Be aware of platform rate limits:

| Platform | Rate Limit |
|----------|-----------|
| Reddit | 60 requests/minute |
| Dev.to | 30 requests/30 seconds |
| LinkedIn | 1000 requests/day |
| Facebook | 200 requests/hour |
| Twitter | 50 tweets/15 minutes |

## Troubleshooting

### Reddit Issues
- **403 Forbidden**: Check if account has enough karma
- **Subreddit Rules**: Some subreddits block link posts

### Dev.to Issues
- **422 Unprocessable**: Check article formatting
- **401 Unauthorized**: Regenerate API key

### LinkedIn Issues
- **Token Expired**: Access tokens expire after 60 days
- **No Permission**: Ensure app has `w_member_social` scope

### Facebook Issues
- **Invalid Token**: Page tokens can expire, regenerate
- **Page Not Found**: Check Page ID is correct

### Twitter Issues
- **Duplicate Status**: Can't post same content twice
- **Rate Limited**: Wait 15 minutes

## Security Notes

- All API credentials are encrypted in the database
- Never commit credentials to version control
- Use environment variables for encryption keys
- Rotate API keys regularly
- Use OAuth where possible instead of API keys

## API Response Format

Successful publish response:
```json
[
  {
    "platform": "reddit",
    "status": "success",
    "url": "https://reddit.com/r/webdev/comments/..."
  },
  {
    "platform": "devto",
    "status": "success",
    "url": "https://dev.to/username/article-slug"
  }
]
```

Error response:
```json
[
  {
    "platform": "twitter",
    "status": "error",
    "message": "Rate limit exceeded"
  }
]
```

## Best Practices

1. **Content Adaptation**
   - Customize message for each platform
   - Use platform-specific hashtags
   - Respect character limits

2. **Timing**
   - Schedule posts for optimal engagement
   - Avoid posting to all platforms simultaneously
   - Respect platform rate limits

3. **Monitoring**
   - Track engagement across platforms
   - Monitor for failed posts
   - Check publish history regularly

4. **Compliance**
   - Follow platform terms of service
   - Disclose automated posting where required
   - Respect subreddit/group rules