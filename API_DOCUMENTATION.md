# XMUS CRM API Documentation

## Authentication Endpoints

### 1. Login
**POST** `/api/v1/auth/login`

Login with email and password to get access and refresh tokens.

**Request Body:**
```json
{
  "email": "amupxm@gmail.com",
  "password": "1202212022"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "amupxm@gmail.com",
      "first_name": "amup",
      "last_name": "mokarrami",
      "is_active": true,
      "last_login": "2024-01-01T12:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900
  }
}
```

### 2. Refresh Token
**POST** `/api/v1/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900
  }
}
```

### 3. Logout
**POST** `/api/v1/auth/logout`

Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Protected Routes

### 1. User Profile
**GET** `/api/v1/protected/profile`

Get user profile information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Access granted to protected route",
  "user_id": 1
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/tokens)
- `500` - Internal Server Error

## Token Information

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Token Type**: JWT (JSON Web Token)
- **Algorithm**: HS256

## Usage Examples

### cURL Examples

1. **Login:**
```bash
curl -X POST http://localhost:9090/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amupxm@gmail.com",
    "password": "1202212022"
  }'
```

2. **Refresh Token:**
```bash
curl -X POST http://localhost:9090/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token_here"
  }'
```

3. **Logout:**
```bash
curl -X POST http://localhost:9090/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token_here"
  }'
```

4. **Access Protected Route:**
```bash
curl -X GET http://localhost:9090/api/v1/protected/profile \
  -H "Authorization: Bearer your_access_token_here"
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Refresh token rotation
- Token expiration validation
- User account status checking
- Input validation and sanitization
- Secure error handling (no sensitive data exposure)
