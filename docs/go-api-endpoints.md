# Go API Endpoints for Component Editor

## GET /api/component-data
Fetches JSON data for a component

**Query Parameters:**
- `path` - The JSON file name (e.g., "hero.json", "skills.json")
- `site` - The site domain (e.g., "prestongarrison.com")

**Response:**
- 200: JSON content of the file
- 404: File not found

**Example:**
```
GET http://localhost:8080/api/component-data?path=hero.json&site=prestongarrison.com
```

## PUT /api/component-data
Updates JSON data for a component

**Request Body:**
```json
{
  "path": "hero.json",
  "site": "prestongarrison.com",
  "data": {
    // The updated JSON content
  }
}
```

**Response:**
- 200: Success
- 400: Bad request
- 500: Server error

**Implementation Notes:**
1. The Go server should read/write files from: `astro-multi-tenant/src/sites/[site]/data/[path]`
2. In production, you might want to add authentication
3. Consider adding validation for the JSON structure
4. Could add version control/backup before overwriting files

## Optional: List Components
**GET /api/components**
Lists all available components for a site

**Query Parameters:**
- `site` - The site domain

**Response:**
```json
{
  "components": [
    "hero.json",
    "skills.json",
    "projects.json"
  ]
}
```