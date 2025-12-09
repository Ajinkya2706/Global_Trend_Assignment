# GitHub API Integration Service

A production-ready REST API service that fetches, caches, and aggregates GitHub user and repository data with advanced filtering capabilities. Built for the GLOBAL TREND API Integration Internship assignment.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Filtering Options](#filtering-options)
- [Error Handling](#error-handling)
- [Caching Strategy](#caching-strategy)
- [Testing Guide](#testing-guide)
- [Sample Outputs](#sample-outputs)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

## Features

- Fetch data from multiple GitHub API endpoints
- In-memory LRU cache with configurable TTL
- Advanced filtering and sorting capabilities
- Comprehensive error handling with proper status codes
- Request timeout protection
- Rate limit detection and handling
- Clean REST API design
- Aggregated statistics computation

## Tech Stack

- **Runtime**: Node.js (ES6 Modules)
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Caching**: Custom in-memory LRU cache
- **API Source**: GitHub REST API v3

## Project Structure

```
github-api-service/
├── src/
│   ├── routes/
│   │   ├── users.routes.js       # User-related endpoints
│   │   ├── repos.routes.js       # Repository endpoints
│   │   └── cache.routes.js       # Cache management
│   ├── services/
│   │   ├── github.service.js     # GitHub API integration logic
│   │   └── cache.service.js      # Caching implementation
│   ├── middleware/
│   │   └── errorHandler.js       # Global error handling
│   ├── utils/
│   │   └── apiClient.js          # Axios configuration
│   └── app.js                    # Express app setup
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## Setup Instructions

### Prerequisites

- Node.js v16 or higher
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd github-api-service
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

4. Start the server

```bash
npm start
```

Server will run on `http://localhost:3000`

### Development Mode

For auto-restart on file changes:

```bash
npm run dev
```

## API Endpoints

### 1. Health Check

Check if the service is running.

**Endpoint**: `GET /api/health`

**Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-12-09T10:30:45.123Z",
  "uptime": 125.456
}
```

### 2. List Users

Fetch a paginated list of GitHub users.

**Endpoint**: `GET /api/users`

**Query Parameters**:
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| limit | integer | 10 | 50 | Number of users to return |
| since | integer | 0 | - | User ID to start from (pagination) |

**Example**:

```bash
GET /api/users?limit=5&since=100
```

**Response**:

```json
{
  "data": [
    {
      "id": 101,
      "login": "octocat",
      "avatar": "https://avatars.githubusercontent.com/u/101",
      "url": "https://github.com/octocat"
    }
  ],
  "meta": {
    "count": 5,
    "since": 100
  },
  "cached": false
}
```

### 3. User Details

Get detailed information about a specific user.

**Endpoint**: `GET /api/users/:username`

**Example**:

```bash
GET /api/users/vercel
```

**Response**:

```json
{
  "user": {
    "login": "vercel",
    "name": "Vercel",
    "bio": "Develop. Preview. Ship.",
    "location": "San Francisco, CA",
    "publicRepos": 152,
    "followers": 25000,
    "following": 10,
    "createdAt": "2015-03-26T18:31:17Z",
    "avatar": "https://avatars.githubusercontent.com/u/14985020"
  },
  "cached": false
}
```

### 4. User Repositories

Fetch repositories for a specific user with filtering options.

**Endpoint**: `GET /api/users/:username/repos`

**Query Parameters**:
| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| sort | string | updated | updated, created, stars | Sort order |
| language | string | all | JavaScript, Python, etc. | Filter by language |
| limit | integer | 10 | 1-50 | Number of results |

**Example**:

```bash
GET /api/users/vercel/repos?language=TypeScript&sort=stars&limit=5
```

**Response**:

```json
{
  "data": [
    {
      "name": "next.js",
      "fullName": "vercel/next.js",
      "description": "The React Framework",
      "language": "TypeScript",
      "stars": 120000,
      "forks": 25000,
      "updatedAt": "2024-12-08T15:30:00Z",
      "url": "https://github.com/vercel/next.js"
    }
  ],
  "filters": {
    "sort": "stars",
    "language": "TypeScript",
    "limit": 5
  },
  "meta": {
    "total": 5
  },
  "cached": false
}
```

### 5. Repository Details

Get detailed information about a specific repository.

**Endpoint**: `GET /api/repos/:owner/:repo`

**Example**:

```bash
GET /api/repos/vercel/next.js
```

**Response**:

```json
{
  "name": "next.js",
  "fullName": "vercel/next.js",
  "description": "The React Framework",
  "owner": "vercel",
  "language": "TypeScript",
  "stars": 120000,
  "forks": 25000,
  "openIssues": 500,
  "topics": ["react", "nextjs", "framework"],
  "createdAt": "2016-10-25T16:27:10Z",
  "updatedAt": "2024-12-08T15:30:00Z",
  "homepage": "https://nextjs.org",
  "url": "https://github.com/vercel/next.js",
  "cached": false
}
```

### 6. User Statistics

Get aggregated statistics across all user repositories.

**Endpoint**: `GET /api/users/:username/stats`

**Example**:

```bash
GET /api/users/microsoft/stats
```

**Response**:

```json
{
  "username": "microsoft",
  "totalRepos": 5000,
  "totalStars": 500000,
  "totalForks": 150000,
  "languageBreakdown": {
    "JavaScript": 1200,
    "TypeScript": 800,
    "Python": 600,
    "C#": 500,
    "Go": 400
  },
  "mostStarredRepo": {
    "name": "vscode",
    "stars": 150000,
    "url": "https://github.com/microsoft/vscode"
  },
  "followers": 100000,
  "cached": false
}
```

### 7. Cache Statistics

View current cache performance metrics.

**Endpoint**: `GET /api/cache/stats`

**Response**:

```json
{
  "size": 15,
  "maxSize": 100,
  "hits": 45,
  "misses": 20,
  "hitRate": "69.23%",
  "ttl": "300s"
}
```

### 8. Clear Cache

Clear all cached data.

**Endpoint**: `DELETE /api/cache/clear`

**Response**:

```json
{
  "message": "Cache cleared successfully",
  "itemsCleared": 15
}
```

## Filtering Options

### User List Filters

- **limit**: Control number of results (1-50)
- **since**: Pagination starting point (user ID)

### Repository Filters

- **language**: Filter by programming language (JavaScript, TypeScript, Python, etc.)
- **sort**: Order results by updated, created, or stars
- **limit**: Control number of results (1-50)

### Filter Combinations

Multiple filters can be combined:

```bash
GET /api/users/facebook/repos?language=JavaScript&sort=stars&limit=10
```

This returns top 10 JavaScript repositories sorted by star count.

## Error Handling

The service handles various error scenarios with appropriate HTTP status codes:

### Network Errors (503)

```json
{
  "error": "Service unavailable",
  "details": "Network error - Could not reach GitHub API"
}
```

### Timeout Errors (504)

```json
{
  "error": "Request timeout",
  "details": "Request timeout - GitHub API took too long to respond"
}
```

### Resource Not Found (404)

```json
{
  "error": "Resource not found",
  "details": "User or repository does not exist"
}
```

### Rate Limit Exceeded (429)

```json
{
  "error": "Rate limit exceeded",
  "details": "Rate limit exceeded. Retry after 45s"
}
```

### Invalid Input (400)

Malformed requests or invalid parameters return descriptive error messages.

## Caching Strategy

### Implementation Details

- **Type**: In-memory LRU (Least Recently Used) cache
- **TTL**: 5 minutes (300 seconds)
- **Max Size**: 100 items
- **Eviction**: Automatic removal of oldest items when full

### Cache Keys

Each request generates a unique cache key based on:

- Endpoint path
- Query parameters
- Resource identifiers

Example: `users:10:0` for user list, `stats:microsoft` for user stats

### Cache Behavior

1. First request fetches from GitHub API (`cached: false`)
2. Subsequent requests within TTL return cached data (`cached: true`)
3. After TTL expiration, fresh data is fetched
4. Cache automatically evicts old entries when limit reached

### Benefits

- Reduced API calls to GitHub
- Faster response times
- Protection against rate limits
- Lower bandwidth usage

## Testing Guide

### Browser Testing

Simply paste URLs in your browser:

```
http://localhost:3000/api/health
http://localhost:3000/api/users?limit=5
http://localhost:3000/api/users/vercel
http://localhost:3000/api/users/vercel/repos?language=TypeScript
http://localhost:3000/api/repos/vercel/next.js
http://localhost:3000/api/users/microsoft/stats
http://localhost:3000/api/cache/stats
```

### Postman Collection

Import these requests into Postman:

1. **Health Check**

   - Method: GET
   - URL: `http://localhost:3000/api/health`

2. **List Users**

   - Method: GET
   - URL: `http://localhost:3000/api/users?limit=5`

3. **User Details**

   - Method: GET
   - URL: `http://localhost:3000/api/users/vercel`

4. **User Repositories**

   - Method: GET
   - URL: `http://localhost:3000/api/users/vercel/repos?language=TypeScript`

5. **Repository Details**

   - Method: GET
   - URL: `http://localhost:3000/api/repos/vercel/next.js`

6. **User Statistics**

   - Method: GET
   - URL: `http://localhost:3000/api/users/microsoft/stats`

7. **Cache Statistics**

   - Method: GET
   - URL: `http://localhost:3000/api/cache/stats`

8. **Clear Cache**
   - Method: DELETE
   - URL: `http://localhost:3000/api/cache/clear`

### Testing Cache Functionality

1. Call any endpoint twice
2. First call: `"cached": false`
3. Second call: `"cached": true`
4. Check cache stats to see hit rate increase

### Testing Error Handling

1. **404 Error**: `GET /api/users/thisuserdoesnotexist999`
2. **Invalid Repo**: `GET /api/repos/facebook/fakerepo`
3. **Malformed URL**: `GET /api/repos/onlyoneparam`

## Sample Outputs

### Successful User Request

```json
{
  "user": {
    "login": "torvalds",
    "name": "Linus Torvalds",
    "bio": "Creator of Linux",
    "publicRepos": 5,
    "followers": 180000
  },
  "cached": false
}
```

### Filtered Repository List

```json
{
  "data": [
    {
      "name": "react",
      "language": "JavaScript",
      "stars": 220000,
      "description": "A JavaScript library for building user interfaces"
    }
  ],
  "filters": {
    "sort": "stars",
    "language": "JavaScript"
  }
}
```

### Error Response

```json
{
  "error": "Resource not found",
  "details": "Request failed with status code 404"
}
```

## Assumptions & Design Decisions

### API Choice

GitHub REST API v3 was selected because:

- No authentication required for basic usage
- Well-documented and reliable
- Rich data structure for demonstrating filtering
- Real-world relevance for developers

### Caching Strategy

- **5-minute TTL**: Balances fresh data with API efficiency
- **In-memory storage**: Fast access, suitable for demo/development
- **LRU eviction**: Keeps most relevant data in cache
- **100 item limit**: Prevents excessive memory usage

### Rate Limiting

- GitHub allows 60 unauthenticated requests per hour
- Service detects rate limit responses (403/429)
- Returns clear error message with retry time
- Can be extended with GitHub token for 5000 req/hour

### Error Handling

- All network errors caught and classified
- 10-second timeout prevents hanging requests
- Axios interceptors provide consistent error format
- Global error handler ensures no unhandled exceptions

### Input Validation

- Limit parameter capped at 50 to prevent abuse
- Negative values converted to defaults
- Invalid sort options fall back to 'updated'
- Missing parameters use sensible defaults

### Data Transformation

- Raw GitHub API responses simplified for clarity
- Only relevant fields included in responses
- Consistent JSON structure across all endpoints
- Timestamps preserved in ISO 8601 format

### Architecture Decisions

- **Separation of concerns**: Routes → Services → API Client
- **Middleware pattern**: Centralized error handling
- **Service layer**: Business logic isolated from routing
- **Reusable client**: Single axios instance with interceptors

### Production Considerations

- CORS enabled for frontend integration
- Structured error responses for debugging
- Cache statistics for monitoring
- Environment variable support for configuration

### Limitations

- No persistent storage (cache clears on restart)
- No authentication (limited to 60 req/hour)
- No pagination links in responses
- No request queuing for rate limit handling

### Future Enhancements

- Add GitHub authentication token support
- Implement Redis for persistent caching
- Add request rate limiting middleware
- Support webhook integration
- Add GraphQL endpoint alternative
- Implement response compression
- Add request/response logging
- Create automated test suite

## GitHub API Endpoints Used

This service integrates with the following GitHub REST API v3 endpoints:

1. `GET /users` - List public users
2. `GET /users/:username` - Get user details
3. `GET /users/:username/repos` - List user repositories
4. `GET /repos/:owner/:repo` - Get repository details

All responses are cached and transformed for optimal consumption.

## License

MIT

## Author

Built for GLOBAL TREND API Integration Internship Assignment

## Support

For issues or questions, please open an issue in the repository.
