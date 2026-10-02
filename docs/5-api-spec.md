# API Contract & Error Specification

## 1. Global Error Response Standard

ChatX standardizes error delivery across all RESTful API endpoints. All failure responses use standard HTTP status codes accompanied by an informative, machine-readable JSON envelope.

### JSON Error Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GlobalErrorResponse",
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "error": {
      "type": "string",
      "description": "Human-readable error description or localized message"
    },
    "code": {
      "type": "string",
      "description": "Standardized programmatic error code (e.g. AUTH_FAILED, VALIDATION_ERROR)"
    },
    "statusCode": {
      "type": "integer",
      "description": "HTTP status code matching the response header"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO-8601 UTC timestamp of error generation"
    }
  },
  "required": ["success", "error", "statusCode"]
}
```

### HTTP Status Code Mapping
| Status Code | Meaning | Example Trigger Scenario |
| :--- | :--- | :--- |
| **`200 OK`** | Request fulfilled successfully | Profile updated, contact list fetched, messages retrieved |
| **`201 Created`** | Resource created successfully | New user registered, channel created |
| **`400 Bad Request`** | Syntactic or validation failure | Missing email/password, password under 8 characters, missing file |
| **`401 Unauthorized`** | Authentication credentials absent or invalid | Missing JWT cookie, expired session token |
| **`403 Forbidden`** | Authenticated user lacks permission | User attempting to read messages of a channel they do not belong to |
| **`404 Not Found`** | Requested resource does not exist | User email not registered, channel ID does not exist |
| **`409 Conflict`** | State conflict with existing database records | Attempting signup with an email that is already registered |
| **`429 Too Many Requests`** | Rate limit threshold exceeded | Exceeding 20 login attempts in 15 minutes or 30 searches in 1 minute |
| **`500 Internal Error`** | Unhandled exception on server | Database connection drop, filesystem I/O write failure |

---

## 2. Endpoint Registry

### Authentication Domain (`/api/auth`)
*Router*: [AuthRoutes.js](file:///home/rishab/Personal/WebDev/ChatX/server/routes/AuthRoutes.js) | *Controller*: [AuthController.js](file:///home/rishab/Personal/WebDev/ChatX/server/controllers/AuthController.js)

| Method | Endpoint | Auth Level | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | 20 req / 15 min | Creates user account, hashes password with BCrypt, and sets 3-day JWT cookie. |
| `POST` | `/api/auth/login` | Public | 20 req / 15 min | Verifies email and password, returning user data and setting JWT cookie. |
| `GET` | `/api/auth/user-info` | `verifyToken` | Standard | Returns authenticated user profile, setup status, and avatar image. |
| `POST` | `/api/auth/update-profile` | `verifyToken` | Standard | Updates first name, last name, avatar color, and sets `profileSetup: true`. |
| `POST` | `/api/auth/add-profile-image` | `verifyToken` | Standard | Accepts multipart avatar image (max 5MB), saves to disk, updates user record. |
| `DELETE` | `/api/auth/remove-profile-image`| `verifyToken` | Standard | Deletes avatar file from server disk and resets `user.image` to `null`. |
| `POST` | `/api/auth/logout` | Public | Standard | Clears `jwt` cookie by sending expired cookie (`maxAge: 1`). |

### Contacts Domain (`/api/contacts`)
*Router*: [ContactRoutes.js](file:///home/rishab/Personal/WebDev/ChatX/server/routes/ContactRoutes.js) | *Controller*: [ContactsController.js](file:///home/rishab/Personal/WebDev/ChatX/server/controllers/ContactsController.js)

| Method | Endpoint | Auth Level | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/contacts/search` | `verifyToken` | 30 req / 1 min | Case-insensitive regex search by name or email, excluding requesting user. |
| `GET` | `/api/contacts/get-contacts-for-dm` | `verifyToken` | Standard | Aggregates messages to return sorted contact list with recency timestamps. |
| `GET` | `/api/contacts/get-all-contacts` | `verifyToken` | Standard | Returns all users formatted as `{ label, value }` for channel invitation pickers. |

### Messages Domain (`/api/messages`)
*Router*: [MessagesRoute.js](file:///home/rishab/Personal/WebDev/ChatX/server/routes/MessagesRoute.js) | *Controller*: [MessagesController.js](file:///home/rishab/Personal/WebDev/ChatX/server/controllers/MessagesController.js)

| Method | Endpoint | Auth Level | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/messages/get-messages` | `verifyToken` | Standard | Fetches historical direct messages between authenticated user and target ID. |
| `POST` | `/api/messages/upload-file` | `verifyToken` | Standard | Accepts multipart file attachment (max 10MB), returns storage file path. |

### Channels Domain (`/api/channels`)
*Router*: [ChannelRoutes.js](file:///home/rishab/Personal/WebDev/ChatX/server/routes/ChannelRoutes.js) | *Controller*: [ChannelController.js](file:///home/rishab/Personal/WebDev/ChatX/server/controllers/ChannelController.js)

| Method | Endpoint | Auth Level | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/channels/create-channel` | `verifyToken` | Standard | Creates channel document, verifies member existence, and designates admin. |
| `GET` | `/api/channels/get-user-channels` | `verifyToken` | Standard | Retrieves all channels where user is either member or admin, sorted by activity. |
| `GET` | `/api/channels/get-channel-messages/:channelId` | `verifyToken` | Standard | Returns channel messages with populated sender data, verifying user membership. |

### Health & Monitoring Domain
*Router*: [index.js](file:///home/rishab/Personal/WebDev/ChatX/server/index.js#L78-L80)

| Method | Endpoint | Auth Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Liveness probe returning server status and UTC timestamp. |

---

## 3. Deep-Dive Payloads for Core Routes

### Route 1: User Login (`POST /api/auth/login`)

#### Request Specification
```http
POST /api/auth/login HTTP/1.1
Host: api.chatx.com
Content-Type: application/json
Origin: https://chat-x-three-gamma.vercel.app

{
  "email": "alex.chen@example.com",
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Set-Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Max-Age=259200; Path=/; Expires=Tue, 06 Oct 2026 04:57:19 GMT; HttpOnly; Secure; SameSite=None

{
  "user": {
    "id": "670c5e7b2f8a1e0012345678",
    "email": "alex.chen@example.com",
    "firstName": "Alex",
    "lastName": "Chen",
    "profileSetup": true
  }
}
```

#### Failure Responses
##### Scenario A: Missing Credentials (`400 Bad Request`)
```json
// Status: 400 Bad Request
"Email and Password are required"
```

##### Scenario B: Invalid Credentials (`400 Bad Request`)
```json
// Status: 400 Bad Request
"Password is not correct"
```

##### Scenario C: User Not Found (`404 Not Found`)
```json
// Status: 404 Not Found
"User with the given email not found."
```

##### Scenario D: Rate Limit Exhaustion (`429 Too Many Requests`)
```json
// Status: 429 Too Many Requests
{
  "error": "Too many authentication attempts, please try again later."
}
```

---

### Route 2: Retrieve Direct Messages (`POST /api/messages/get-messages`)

#### Request Specification
```http
POST /api/messages/get-messages HTTP/1.1
Host: api.chatx.com
Content-Type: application/json
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Origin: https://chat-x-three-gamma.vercel.app

{
  "id": "670c5f9d2f8a1e0087654321"
}
```

#### Success Response (`200 OK`)
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "storedMessages": [
    {
      "_id": "670c604a2f8a1e0099887766",
      "sender": "670c5e7b2f8a1e0012345678",
      "recipient": "670c5f9d2f8a1e0087654321",
      "messageType": "text",
      "content": "Hey Bob, are the deployment configs ready?",
      "timestamp": "2026-10-03T04:30:00.000Z",
      "__v": 0
    },
    {
      "_id": "670c609c2f8a1e0099887767",
      "sender": "670c5f9d2f8a1e0087654321",
      "recipient": "670c5e7b2f8a1e0012345678",
      "messageType": "file",
      "fileUrl": "uploads/files/1727931200000/architecture-spec.pdf",
      "timestamp": "2026-10-03T04:31:15.000Z",
      "__v": 0
    }
  ]
}
```

#### Failure Responses
##### Scenario A: Missing Recipient ID (`400 Bad Request`)
```json
// Status: 400 Bad Request
"Both user IDs are required"
```

##### Scenario B: Unauthenticated Request (`401 Unauthorized`)
```json
// Status: 401 Unauthorized
"You are not authenticated, login or signup first!"
```

##### Scenario C: Cryptographically Invalid or Expired Token (`403 Forbidden`)
```json
// Status: 403 Forbidden
"Token is not valid"
```

---

### Route 3: Create Collaborative Channel (`POST /api/channels/create-channel`)

#### Request Specification
```http
POST /api/channels/create-channel HTTP/1.1
Host: api.chatx.com
Content-Type: application/json
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Origin: https://chat-x-three-gamma.vercel.app

{
  "nameOfChannel": "platform-engineering",
  "members": [
    "670c5f9d2f8a1e0087654321",
    "670c611a2f8a1e0055443322"
  ]
}
```

#### Success Response (`201 Created`)
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "channel": {
    "_id": "670c62002f8a1e0011223344",
    "nameOfChannel": "platform-engineering",
    "admin": "670c5e7b2f8a1e0012345678",
    "members": [
      "670c5f9d2f8a1e0087654321",
      "670c611a2f8a1e0055443322"
    ],
    "messages": [],
    "createdAt": "2026-10-03T04:55:00.000Z",
    "updatedAt": "2026-10-03T04:55:00.000Z",
    "__v": 0
  }
}
```

#### Failure Responses
##### Scenario A: Non-Existent Member IDs Passed (`400 Bad Request`)
```json
// Status: 400 Bad Request
"Some users are not valid users"
```

##### Scenario B: Missing Authentication Cookie (`401 Unauthorized`)
```json
// Status: 401 Unauthorized
"You are not authenticated, login or signup first!"
```

---

## 4. Real-Time WebSocket Event Contract

*Engine*: [socket.js](file:///home/rishab/Personal/WebDev/ChatX/server/socket.js)

### Event: `sendMessage` (Client -> Server)
Transmitted when a user dispatches a direct message.

```json
{
  "recipient": "670c5f9d2f8a1e0087654321",
  "content": "Reviewing the pull request now.",
  "messageType": "text",
  "fileUrl": undefined
}
```

### Event: `recieveMessage` (Server -> Client)
Pushed by the server to both recipient and sender sockets.

```json
{
  "_id": "670c63402f8a1e0099887788",
  "sender": {
    "id": "670c5e7b2f8a1e0012345678",
    "email": "alex.chen@example.com",
    "firstName": "Alex",
    "lastName": "Chen",
    "image": "uploads/profiles/1727931200000.png",
    "color": 2
  },
  "recipient": {
    "id": "670c5f9d2f8a1e0087654321",
    "email": "bob.smith@example.com",
    "firstName": "Bob",
    "lastName": "Smith",
    "image": null,
    "color": 0
  },
  "messageType": "text",
  "content": "Reviewing the pull request now.",
  "timestamp": "2026-10-03T04:56:10.000Z"
}
```

### Event: `send-channel-message` (Client -> Server)
Transmitted when posting inside a group channel.

```json
{
  "channelId": "670c62002f8a1e0011223344",
  "content": "Release v1.2.0 deployed to staging.",
  "messageType": "text",
  "fileUrl": null
}
```

### Event: `recieve-channel-message` (Server -> Client)
Broadcast to all connected members and the channel administrator.

```json
{
  "_id": "670c64112f8a1e0099887799",
  "channelId": "670c62002f8a1e0011223344",
  "sender": {
    "_id": "670c5e7b2f8a1e0012345678",
    "email": "alex.chen@example.com",
    "firstName": "Alex",
    "lastName": "Chen",
    "image": "uploads/profiles/1727931200000.png",
    "color": 2
  },
  "recipient": null,
  "messageType": "text",
  "content": "Release v1.2.0 deployed to staging.",
  "fileUrl": null,
  "timestamp": "2026-10-03T04:57:00.000Z"
}
```
