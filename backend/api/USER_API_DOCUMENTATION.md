# User API Documentation

This document describes the User API endpoints for the XMUS CRM application.

## Base URL
```
/api/v1/users
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Current User (`GET /get_me`)

Returns the current authenticated user's information including roles and teams.

**Permission Required:** None (user can always access their own information)

**Response:**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "salary": 50000.0,
    "salary_currency": "USD",
    "primary_role_id": 1,
    "primary_team_id": 1,
    "roles": [
      {
        "id": 1,
        "name": "EMPLOYEE",
        "description": "Regular employee with basic permissions"
      }
    ],
    "teams": [
      {
        "id": 1,
        "name": "DEVELOPMENT_TEAM",
        "description": "Software development team"
      }
    ],
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Create User (`POST /`)

Creates a new user in the system.

**Permission Required:** `CREATE_USERS`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "salary": 60000.0,
  "salary_currency": "USD",
  "primary_role_id": 1,
  "primary_team_id": 1,
  "role_ids": [1, 2],
  "team_ids": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "is_active": true,
    "salary": 60000.0,
    "salary_currency": "USD",
    "primary_role_id": 1,
    "primary_team_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Get Users List (`GET /`)

Retrieves a paginated list of users.

**Permission Required:** `READ_USERS`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example:** `GET /api/v1/users?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "salary": 50000.0,
      "salary_currency": "USD",
      "primary_role_id": 1,
      "primary_team_id": 1,
      "last_login": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### 4. Get User by ID (`GET /:id`)

Retrieves a specific user by their ID.

**Permission Required:** `READ_USERS`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "salary": 50000.0,
    "salary_currency": "USD",
    "primary_role_id": 1,
    "primary_team_id": 1,
    "roles": [
      {
        "id": 1,
        "name": "EMPLOYEE",
        "description": "Regular employee with basic permissions"
      }
    ],
    "teams": [
      {
        "id": 1,
        "name": "DEVELOPMENT_TEAM",
        "description": "Software development team"
      }
    ],
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Update User (`PUT /:id`)

Updates an existing user.

**Permission Required:** `UPDATE_USERS`

**Request Body (all fields optional):**
```json
{
  "email": "updated@example.com",
  "first_name": "Updated",
  "last_name": "Name",
  "salary": 65000.0,
  "salary_currency": "USD",
  "is_active": true,
  "primary_role_id": 2,
  "primary_team_id": 2,
  "role_ids": [2, 3],
  "team_ids": [2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "email": "updated@example.com",
    "first_name": "Updated",
    "last_name": "Name",
    "is_active": true,
    "salary": 65000.0,
    "salary_currency": "USD",
    "primary_role_id": 2,
    "primary_team_id": 2,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### 6. Delete User (`DELETE /:id`)

Deletes a user from the system.

**Permission Required:** `DELETE_USERS`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions to [action]"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Field 'email' is required",
    "Field 'password' must be at least 6 characters"
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Permission Matrix

| Role | CREATE_USERS | READ_USERS | UPDATE_USERS | DELETE_USERS |
|------|-------------|------------|--------------|--------------|
| Employee | ❌ | ✅ | ❌ | ❌ |
| Team Lead | ❌ | ✅ | ✅ | ❌ |
| HR | ✅ | ✅ | ✅ | ❌ |
| Management | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |

## Usage Examples

### cURL Examples

#### Get Current User
```bash
curl -X GET "http://localhost:8080/api/v1/users/get_me" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Create User
```bash
curl -X POST "http://localhost:8080/api/v1/users" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "salary": 60000.0,
    "salary_currency": "USD",
    "primary_role_id": 1,
    "primary_team_id": 1
  }'
```

#### Get Users List
```bash
curl -X GET "http://localhost:8080/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer your_jwt_token"
```

#### Update User
```bash
curl -X PUT "http://localhost:8080/api/v1/users/1" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated Name",
    "salary": 65000.0
  }'
```

#### Delete User
```bash
curl -X DELETE "http://localhost:8080/api/v1/users/1" \
  -H "Authorization: Bearer your_jwt_token"
```

## Notes

1. **Password Security**: Passwords are automatically hashed using bcrypt before storage.
2. **Self-Deletion Prevention**: Users cannot delete their own accounts.
3. **Role and Team Assignment**: When creating or updating users, you can assign multiple roles and teams.
4. **Pagination**: The users list endpoint supports pagination with configurable page size.
5. **Validation**: All input data is validated according to the defined rules.
6. **Audit Trail**: All user operations are logged and tracked.
