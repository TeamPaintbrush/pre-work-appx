# 📡 API Reference - Pre-Work App

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
All API endpoints expect proper authentication headers when dealing with user-specific data.

---

## 👥 Users API

### GET /api/users
Get all users (Admin only)

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/users
Create a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### PUT /api/users/[id]
Update user information

**Request Body:**
```json
{
  "name": "John Smith",
  "role": "manager",
  "isActive": false
}
```

### DELETE /api/users/[id]
Soft delete a user (sets isActive to false)

---

## 👤 Profiles API

### GET /api/profiles
Get all profiles for the current user

**Response:**
```json
{
  "profiles": [
    {
      "id": "profile_123",
      "userId": "user_123",
      "name": "Work Profile",
      "type": "professional",
      "customFields": {
        "department": "Engineering",
        "location": "New York"
      },
      "isDefault": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/profiles
Create a new profile

**Request Body:**
```json
{
  "name": "Personal Profile",
  "type": "personal",
  "customFields": {
    "hobby": "Photography",
    "location": "California"
  },
  "isDefault": false
}
```

### PUT /api/profiles/[id]
Update profile information

**Request Body:**
```json
{
  "name": "Updated Profile Name",
  "customFields": {
    "department": "Marketing",
    "location": "Los Angeles"
  }
}
```

### DELETE /api/profiles/[id]
Delete a profile

---

## 📁 Media API

### POST /api/media/upload
Get presigned URL for file upload

**Request Body:**
```json
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000,
  "userId": "user_123"
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/presigned-url",
  "fileUrl": "https://s3.amazonaws.com/bucket/file-path",
  "fileId": "file_123"
}
```

### GET /api/media/[fileId]
Get file information and download URL

**Response:**
```json
{
  "file": {
    "id": "file_123",
    "originalName": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "uploadedBy": "user_123",
    "downloadUrl": "https://s3.amazonaws.com/bucket/download-url",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### DELETE /api/media/[fileId]
Delete a file

---

## 📊 Audit API

### GET /api/audit
Get audit logs (Admin/Manager only)

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "logs": [
    {
      "id": "audit_123",
      "userId": "user_123",
      "action": "user.created",
      "details": {
        "targetUserId": "user_456",
        "changes": {"role": "user"}
      },
      "timestamp": "2024-01-15T10:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "total": 150,
  "hasMore": true
}
```

---

## ❌ Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Email is required",
  "details": {
    "field": "email",
    "code": "REQUIRED"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 🔐 Authentication Headers

Include these headers in requests that require authentication:

```http
Authorization: Bearer your-jwt-token
Content-Type: application/json
```

## 📝 Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute
- **Admin endpoints**: 50 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)
