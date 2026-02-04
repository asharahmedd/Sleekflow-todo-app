# 📡 SleekFlow Todo API Documentation

Complete API reference for the SleekFlow Todo Application.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Todos](#todo-endpoints)
  - [Comments](#comment-endpoints)
  - [Notifications](#notification-endpoints)
- [Real-time Events](#real-time-events)
- [Data Models](#data-models)
- [Status Codes](#status-codes)

---

## Overview

The SleekFlow Todo API is a RESTful API built with Express.js and TypeScript. It provides endpoints for user authentication, todo management, real-time collaboration, and notification preferences.

**Version:** 1.0.0  
**Protocol:** HTTP/HTTPS  
**Data Format:** JSON  
**Authentication:** JWT Bearer Token

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### How to Authenticate

1. **Register or Login** to receive a JWT token
2. **Include the token** in the `Authorization` header for all protected routes:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

- Default expiration: **30 days**
- Tokens are stateless and cannot be revoked
- Store tokens securely (localStorage/sessionStorage)

---

## Base URL

### Development
```
http://localhost:5000/api
```

### Production
```
https://your-domain.com/api
```

---

## Response Format

All responses follow a consistent structure using DTOs (Data Transfer Objects).

### Success Response
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  ...
}
```

### Error Response
```json
{
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2026-02-04T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Validation Error Response
```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "timestamp": "2026-02-04T12:00:00.000Z",
  "path": "/api/endpoint",
  "errors": [
    "Name is required",
    "Email must be valid"
  ]
}
```

---

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages.

### Common Error Codes

| Status Code | Meaning | Description |
|------------|---------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permission for this resource |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider:
- 100 requests per 15 minutes per IP for authentication endpoints
- 1000 requests per 15 minutes per IP for other endpoints

---

## Endpoints

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response:** `201 Created`
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-04T12:00:00.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjFhMmIzYzRkNWU2ZjdnOGg5aTBqMSIsImlhdCI6MTcwNzA0ODAwMCwiZXhwIjoxNzA5NjQwMDAwfQ.signature"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "errors": ["Email must be a valid email"]
}
```

`400 Bad Request` - User already exists
```json
{
  "message": "User already exists",
  "statusCode": 400
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### Login User

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Success Response:** `200 OK`
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-04T12:00:00.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

`401 Unauthorized` - Invalid credentials
```json
{
  "message": "Invalid credentials",
  "statusCode": 401
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### Get Current User

Retrieve the authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-04T12:00:00.000Z"
}
```

**Error Responses:**

`401 Unauthorized` - No token provided
```json
{
  "message": "Not authorized, no token",
  "statusCode": 401
}
```

`404 Not Found` - User not found
```json
{
  "message": "User not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Search Users

Search for users by name or email.

**Endpoint:** `GET /api/auth/users/search`

**Authentication:** Required

**Query Parameters:**
- `q` (required): Search query string

**Success Response:** `200 OK`
```json
[
  {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
]
```

**Features:**
- Case-insensitive search
- Searches both name and email fields
- Excludes the current user from results
- Limited to 10 results

**Error Responses:**

`400 Bad Request` - Missing query parameter
```json
{
  "message": "Query is required",
  "statusCode": 400
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/auth/users/search?q=john" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Todo Endpoints

### Get All Todos

Retrieve all todos accessible to the authenticated user (owned + shared).

**Endpoint:** `GET /api/todos`

**Authentication:** Required

**Success Response:** `200 OK`
```json
[
  {
    "id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "name": "Complete Project",
    "description": "Finish the SleekFlow todo app",
    "status": "In Progress",
    "priority": "High",
    "dueDate": "2026-02-10T00:00:00.000Z",
    "createdBy": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "sharedWith": [
      {
        "id": "65f3c4d5e6f7g8h9i0j1k2l3",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ],
    "createdAt": "2026-02-04T12:00:00.000Z",
    "updatedAt": "2026-02-04T13:30:00.000Z"
  }
]
```

**Features:**
- Returns todos where user is creator OR shared user
- Sorted by creation date (newest first)
- Includes populated user references

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Create Todo

Create a new todo item.

**Endpoint:** `POST /api/todos`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Complete Project",
  "description": "Finish the SleekFlow todo app",
  "dueDate": "2026-02-10",
  "status": "Not Started",
  "priority": "High"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `description`: Required, non-empty string
- `dueDate`: Required, valid date
- `status`: Optional, one of: "Not Started", "In Progress", "Completed" (default: "Not Started")
- `priority`: Optional, one of: "Low", "Medium", "High" (default: "Medium")

**Success Response:** `201 Created`
```json
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Complete Project",
  "description": "Finish the SleekFlow todo app",
  "status": "Not Started",
  "priority": "High",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "createdBy": "65f1a2b3c4d5e6f7g8h9i0j1",
  "sharedWith": [],
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T12:00:00.000Z"
}
```

**Side Effects:**
- Broadcasts "todo_created" activity via Socket.io

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "errors": ["Name is required", "Due date is required"]
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete Project",
    "description": "Finish the SleekFlow todo app",
    "dueDate": "2026-02-10",
    "priority": "High"
  }'
```

---

### Get Todo by ID

Retrieve a specific todo by its ID.

**Endpoint:** `GET /api/todos/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Todo ID (MongoDB ObjectId)

**Success Response:** `200 OK`
```json
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Complete Project",
  "description": "Finish the SleekFlow todo app",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "createdBy": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "sharedWith": [],
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T13:30:00.000Z"
}
```

**Error Responses:**

`403 Forbidden` - User doesn't have access
```json
{
  "message": "Not authorized to access this todo",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Todo

Update an existing todo. Supports partial updates.

**Endpoint:** `PUT /api/todos/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Todo ID (MongoDB ObjectId)

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "Completed",
  "priority": "Medium",
  "dueDate": "2026-02-15"
}
```

**Validation Rules:**
- `name`: Optional, non-empty string if provided
- `description`: Optional, non-empty string if provided
- `status`: Optional, one of: "Not Started", "In Progress", "Completed"
- `priority`: Optional, one of: "Low", "Medium", "High"
- `dueDate`: Optional, valid date if provided

**Success Response:** `200 OK`
```json
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Updated Name",
  "description": "Updated description",
  "status": "Completed",
  "priority": "Medium",
  "dueDate": "2026-02-15T00:00:00.000Z",
  "createdBy": "65f1a2b3c4d5e6f7g8h9i0j1",
  "sharedWith": [],
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T14:00:00.000Z"
}
```

**Side Effects:**
- Broadcasts activity based on what changed:
  - Status changed: "todo_status_changed"
  - Completed: "todo_completed"
  - Priority changed: "todo_priority_changed"

**Error Responses:**

`403 Forbidden` - User doesn't have access
```json
{
  "message": "Not authorized to update this todo",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }'
```

---

### Delete Todo

Delete a todo. Only the creator can delete.

**Endpoint:** `DELETE /api/todos/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Todo ID (MongoDB ObjectId)

**Success Response:** `200 OK`
```json
{
  "message": "Todo deleted successfully"
}
```

**Side Effects:**
- Broadcasts "todo_deleted" activity via Socket.io
- All associated comments are orphaned (not automatically deleted)

**Error Responses:**

`403 Forbidden` - User is not the creator
```json
{
  "message": "Only the creator can delete this todo",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Share Todo

Share a todo with another user. Only the creator can share.

**Endpoint:** `POST /api/todos/:id/share`

**Authentication:** Required

**URL Parameters:**
- `id`: Todo ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "userEmail": "jane@example.com"
}
```

**Validation Rules:**
- `userEmail`: Required, valid email, user must exist

**Success Response:** `200 OK`
```json
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Complete Project",
  "description": "Finish the SleekFlow todo app",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "createdBy": "65f1a2b3c4d5e6f7g8h9i0j1",
  "sharedWith": [
    {
      "id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T14:00:00.000Z"
}
```

**Side Effects:**
- Broadcasts "todo_shared" activity via Socket.io
- Sends email notification to shared user (if preferences allow)

**Error Responses:**

`403 Forbidden` - User is not the creator
```json
{
  "message": "Only the creator can share this todo",
  "statusCode": 403
}
```

`404 Not Found` - User to share with doesn't exist
```json
{
  "message": "User not found",
  "statusCode": 404
}
```

`400 Bad Request` - Todo already shared with user
```json
{
  "message": "Todo already shared with this user",
  "statusCode": 400
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2/share \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "jane@example.com"
  }'
```

---

### Unshare Todo

Remove a user from a shared todo. Only the creator can unshare.

**Endpoint:** `DELETE /api/todos/:todoId/share/:userId`

**Authentication:** Required

**URL Parameters:**
- `todoId`: Todo ID (MongoDB ObjectId)
- `userId`: User ID to remove (MongoDB ObjectId)

**Success Response:** `200 OK`
```json
{
  "message": "Todo unshared successfully"
}
```

**Side Effects:**
- Broadcasts "todo_unshared" activity via Socket.io

**Error Responses:**

`403 Forbidden` - User is not the creator
```json
{
  "message": "Only the creator can unshare this todo",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2/share/65f3c4d5e6f7g8h9i0j1k2l3 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Get Shared Users

Get all users who have access to a todo (creator + shared users).

**Endpoint:** `GET /api/todos/:id/shared-users`

**Authentication:** Required

**URL Parameters:**
- `id`: Todo ID (MongoDB ObjectId)

**Success Response:** `200 OK`
```json
{
  "creator": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "sharedWith": [
    {
      "id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    {
      "id": "65f4d5e6f7g8h9i0j1k2l3m4",
      "name": "Bob Johnson",
      "email": "bob@example.com"
    }
  ]
}
```

**Error Responses:**

`403 Forbidden` - User doesn't have access
```json
{
  "message": "Not authorized to view shared users",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2/shared-users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Comment Endpoints

### Get Comments

Retrieve all comments for a specific todo.

**Endpoint:** `GET /api/todos/:todoId/comments`

**Authentication:** Required

**URL Parameters:**
- `todoId`: Todo ID (MongoDB ObjectId)

**Success Response:** `200 OK`
```json
[
  {
    "id": "65f4d5e6f7g8h9i0j1k2l3m4",
    "todoId": "65f2b3c4d5e6f7g8h9i0j1k2",
    "userId": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "userName": "John Doe",
    "content": "This is a comment on the todo",
    "createdAt": "2026-02-04T12:00:00.000Z",
    "updatedAt": "2026-02-04T12:00:00.000Z"
  },
  {
    "id": "65f5e6f7g8h9i0j1k2l3m4n5",
    "todoId": "65f2b3c4d5e6f7g8h9i0j1k2",
    "userId": {
      "id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "userName": "Jane Smith",
    "content": "Great progress on this!",
    "createdAt": "2026-02-04T13:00:00.000Z",
    "updatedAt": "2026-02-04T13:00:00.000Z"
  }
]
```

**Features:**
- Returns comments sorted by creation date (oldest first)
- Includes populated user information

**Error Responses:**

`403 Forbidden` - User doesn't have access to todo
```json
{
  "message": "Not authorized to view comments",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2/comments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Create Comment

Add a comment to a todo.

**Endpoint:** `POST /api/todos/:todoId/comments`

**Authentication:** Required

**URL Parameters:**
- `todoId`: Todo ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "content": "This is my comment on the todo"
}
```

**Validation Rules:**
- `content`: Required, non-empty string, max 1000 characters

**Success Response:** `201 Created`
```json
{
  "id": "65f4d5e6f7g8h9i0j1k2l3m4",
  "todoId": "65f2b3c4d5e6f7g8h9i0j1k2",
  "userId": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "userName": "John Doe",
  "content": "This is my comment on the todo",
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T12:00:00.000Z"
}
```

**Side Effects:**
- Broadcasts "comment_added" activity via Socket.io
- Sends email notifications to todo creator and shared users (if preferences allow)

**Error Responses:**

`403 Forbidden` - User doesn't have access to todo
```json
{
  "message": "Not authorized to comment on this todo",
  "statusCode": 403
}
```

`404 Not Found` - Todo doesn't exist
```json
{
  "message": "Todo not found",
  "statusCode": 404
}
```

`400 Bad Request` - Validation error
```json
{
  "message": "Content is required",
  "statusCode": 400
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2/comments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my comment on the todo"
  }'
```

---

### Get Comment Count

Get the total number of comments for a todo.

**Endpoint:** `GET /api/todos/:todoId/comments/count`

**Authentication:** Required

**URL Parameters:**
- `todoId`: Todo ID (MongoDB ObjectId)

**Success Response:** `200 OK`
```json
{
  "count": 5
}
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/todos/65f2b3c4d5e6f7g8h9i0j1k2/comments/count \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Notification Endpoints

### Get Notification Preferences

Retrieve the current user's notification preferences.

**Endpoint:** `GET /api/notifications/preferences`

**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "emailOnTodoShared": true,
  "emailOnComment": true
}
```

**Default Values:**
- `emailOnTodoShared`: `true`
- `emailOnComment`: `true`

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Notification Preferences

Update the current user's notification preferences.

**Endpoint:** `PUT /api/notifications/preferences`

**Authentication:** Required

**Request Body:**
```json
{
  "emailOnTodoShared": false,
  "emailOnComment": true
}
```

**Success Response:** `200 OK`
```json
{
  "emailOnTodoShared": false,
  "emailOnComment": true
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "emailOnTodoShared": false,
    "emailOnComment": true
  }'
```

---

## Real-time Events

The API uses Socket.io for real-time communication.

### Connection

**Server URL:** `http://localhost:5000`

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Events

#### new-activity

Broadcasted when any user action occurs (create, update, share, comment, etc.).

**Event Name:** `new-activity`

**Payload:**
```json
{
  "type": "todo_created",
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "userName": "John Doe",
  "message": "John Doe created a new todo: Complete Project",
  "metadata": {
    "todoId": "65f2b3c4d5e6f7g8h9i0j1k2",
    "todoName": "Complete Project"
  },
  "createdAt": "2026-02-04T12:00:00.000Z"
}
```

**Activity Types:**
- `user_registered` - New user registered
- `user_logged_in` - User logged in
- `todo_created` - Todo created
- `todo_updated` - Todo updated
- `todo_deleted` - Todo deleted
- `todo_shared` - Todo shared with user
- `todo_unshared` - Todo unshared from user
- `todo_status_changed` - Todo status changed
- `todo_completed` - Todo marked as completed
- `todo_priority_changed` - Todo priority changed
- `comment_added` - Comment added to todo

**Example Listener:**
```javascript
socket.on('new-activity', (activity) => {
  console.log('New activity:', activity);
  
  // Update UI based on activity type
  switch (activity.type) {
    case 'todo_created':
      // Refresh todo list
      break;
    case 'comment_added':
      // Refresh comments
      break;
    // ... handle other types
  }
});
```

---

## Data Models

### User

```typescript
{
  id: string;              // MongoDB ObjectId
  name: string;            // User's full name
  email: string;           // Unique email (lowercase)
  createdAt: string;       // ISO 8601 date string
  // password is NEVER returned in API responses
}
```

### Todo

```typescript
{
  id: string;              // MongoDB ObjectId
  name: string;            // Todo title
  description: string;     // Todo description
  status: string;          // "Not Started" | "In Progress" | "Completed"
  priority: string;        // "Low" | "Medium" | "High"
  dueDate: string;         // ISO 8601 date string
  createdBy: User | string; // Populated User object or ID
  sharedWith: User[] | string[]; // Array of User objects or IDs
  createdAt: string;       // ISO 8601 date string
  updatedAt: string;       // ISO 8601 date string
}
```

### Comment

```typescript
{
  id: string;              // MongoDB ObjectId
  todoId: string;          // Todo ID
  userId: User | string;   // Populated User object or ID
  userName: string;        // User's name (denormalized)
  content: string;         // Comment text (max 1000 chars)
  createdAt: string;       // ISO 8601 date string
  updatedAt: string;       // ISO 8601 date string
}
```

### Activity

```typescript
{
  type: string;            // Activity type (see Real-time Events)
  userId: string;          // User who performed the action
  userName: string;        // User's name (denormalized)
  message: string;         // Human-readable message
  metadata: object;        // Additional context (e.g., todoId, todoName)
  createdAt: string;       // ISO 8601 date string
}
```

### NotificationPreferences

```typescript
{
  emailOnTodoShared: boolean;  // Send email when todo is shared
  emailOnComment: boolean;     // Send email when comment is added
}
```

---

## Status Codes

### Success Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |

### Client Error Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |

### Server Error Codes

| Code | Name | Description |
|------|------|-------------|
| 500 | Internal Server Error | Server-side error |

---

## Common Use Cases

### 1. Complete Authentication Flow

```javascript
// Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});
const { token } = await registerResponse.json();

// Store token
localStorage.setItem('token', token);

// Use token for subsequent requests
const todosResponse = await fetch('http://localhost:5000/api/todos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. Create and Share a Todo

```javascript
// Create todo
const createResponse = await fetch('http://localhost:5000/api/todos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Team Meeting',
    description: 'Discuss Q1 goals',
    dueDate: '2026-02-15',
    priority: 'High'
  })
});
const todo = await createResponse.json();

// Share with colleague
await fetch(`http://localhost:5000/api/todos/${todo.id}/share`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userEmail: 'colleague@example.com'
  })
});
```

### 3. Add Comment with Real-time Update

```javascript
// Set up Socket.io listener
socket.on('new-activity', (activity) => {
  if (activity.type === 'comment_added') {
    // Refresh comments UI
    loadComments(activity.metadata.todoId);
  }
});

// Add comment
await fetch(`http://localhost:5000/api/todos/${todoId}/comments`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Great work on this!'
  })
});
// Socket.io will broadcast the activity to all connected clients
```

---

## Best Practices

1. **Always include the Authorization header** for protected routes
2. **Handle token expiration** gracefully (redirect to login)
3. **Listen to Socket.io events** for real-time updates
4. **Validate input on client-side** before making requests
5. **Display user-friendly error messages** from API responses
6. **Use HTTPS in production** to encrypt tokens
7. **Store tokens securely** (httpOnly cookies preferred over localStorage)
8. **Implement retry logic** for failed requests
9. **Use pagination** for large datasets (to be implemented)
10. **Rate limit your requests** on client-side

---

## Changelog

### Version 1.0.0 (2026-02-04)
- Initial API release
- Authentication endpoints
- Todo CRUD operations
- Comment system
- Real-time Socket.io events
- Notification preferences
- DTO implementation for validation and response formatting

---

## Support

For issues, questions, or feature requests, please contact the development team or open an issue on GitHub.

---

**Last Updated:** February 4, 2026  
**API Version:** 1.0.0
