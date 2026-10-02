# API Contract & Error Specification

## 1. Global Error Response Standard

> **Implementation Note**: ChatX's controllers do **not** implement a uniform JSON error envelope. Most error responses are plain text strings sent via `res.send()` (e.g., `res.status(400).send("Email and Password are required")`). Only rate limiter errors and a subset of controller errors return JSON objects. The schema below documents the **ideal target schema** for a future standardization sprint, alongside the actual response shapes currently emitted.

### Actual Error Response Shapes (Current)

| Pattern | Example | Used In |
| :--- | :--- | :--- |
| Plain text string | `"Email and Password are required"` | Most auth, contacts, messages, channels controllers |
| JSON object with `error` key | `{ "error": "Too many authentication attempts..." }` | `express-rate-limit` response |
| JSON object with `message` key | `{ "message": "No file uploaded." }` | `addProfileImage` controller |
| JSON object with `error` key | `{ "error": "Route not found" }` | 404 handler in `index.js` |
| JSON object with `error` key | `{ "error": "Internal server error" }` | Global error handler in `index.js` |

### Target JSON Error Schema (Recommended for Standardization)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GlobalErrorResponse",
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "Human-readable error message"
    },
    "code": {
      "type": "string",
      "description": "Programmatic error code e.g. AUTH_FAILED, VALIDATION_ERROR"
    },
    "statusCode": {
      "type": "integer",
      "description": "HTTP status code mirroring the response status"
    }
  },
  "required": ["error"]
}
```

### HTTP Status Code Mapping
| Status Code | Meaning | ChatX Example |
| :--- | :--- | :--- |
| **`200 OK`** | Request fulfilled | Profile updated, contacts fetched, messages retrieved |
| **`201 Created`** | Resource created | User registered (`signup`), channel created |
| **`400 Bad Request`** | Validation failure | Missing email/password, password under 8 chars, no file in upload, invalid members |
| **`401 Unauthorized`** | Missing JWT cookie | `req.cookies.jwt` is absent — `verifyToken` returns `"You are not authenticated, login or signup first!"` |
| **`403 Forbidden`** | Invalid JWT signature or expired token | `jwt.verify` fails — returns `"Token is not valid"`. Also returned by `getChannelMessages` if user is not a member or admin. |
| **`404 Not Found`** | Resource does not exist | Email not registered in `login`, user not found in `getUserInfo`, channel not found |
| **`409 Conflict`** | Duplicate resource | Email already registered — `signup` returns `"Email already exists"` |
| **`429 Too Many Requests`** | Rate limit exceeded | `authLimiter` (20 req/15 min) or `searchLimiter` (30 req/1 min) |
| **`500 Internal Error`** | Unhandled server exception | DB connection failure, filesystem I/O error |

---

## 2. Endpoint Registry

### Authentication Domain (`/api/auth`)
*Router*: [AuthRoutes.js](../server/routes/AuthRoutes.js) | *Controller*: [AuthController.js](../server/controllers/AuthController.js)

| Method | Endpoint | Auth Guard | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | None | `authLimiter` 20/15m | Creates user, hashes password via `pre("save")` bcrypt hook, sets `jwt` cookie. |
| `POST` | `/api/auth/login` | None | `authLimiter` 20/15m | Verifies email exists, `bcrypt.compare` password, sets `jwt` cookie. |
| `GET` | `/api/auth/user-info` | `verifyToken` | — | Returns profile for `req.userId`. Used by `App.jsx` on every page load to restore auth state. |
| `POST` | `/api/auth/update-profile` | `verifyToken` | — | Updates `firstName`, `lastName`, `color`; sets `profileSetup: true`. |
| `POST` | `/api/auth/add-profile-image` | `verifyToken` | — | Multer `upload.single("profile-image")` — field name is `profile-image`. Max 5MB. Saves to `uploads/profiles/`. |
| `DELETE` | `/api/auth/remove-profile-image` | `verifyToken` | — | Calls `fs.access` then `fs.unlink` on `user.image` path; sets `user.image = null`. |
| `POST` | `/api/auth/logout` | None | — | Sets `jwt` cookie with `maxAge: 1`, effectively expiring it immediately. |

### Contacts Domain (`/api/contacts`)
*Router*: [ContactRoutes.js](../server/routes/ContactRoutes.js) | *Controller*: [ContactsController.js](../server/controllers/ContactsController.js)

| Method | Endpoint | Auth Guard | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/contacts/search` | `verifyToken` | `searchLimiter` 30/1m | Body: `{ searchTerm }`. Regex-escaped case-insensitive search on `firstName`, `lastName`, `email`. Excludes current user. |
| `GET` | `/api/contacts/get-contacts-for-dm` | `verifyToken` | — | Returns sorted contact list with `lastMessageTime` via Messages aggregation pipeline. |
| `GET` | `/api/contacts/get-all-contacts` | `verifyToken` | — | Returns `[{ label, value }]` array for channel member picker. `label` is `"firstName lastName"` or `email` if name not set. |

### Messages Domain (`/api/messages`)
*Router*: [MessagesRoute.js](../server/routes/MessagesRoute.js) | *Controller*: [MessagesController.js](../server/controllers/MessagesController.js)

| Method | Endpoint | Auth Guard | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/messages/get-messages` | `verifyToken` | — | Body: `{ id: recipientUserId }`. Returns all direct messages between `req.userId` and `id`, sorted by `timestamp` ascending. No pagination. |
| `POST` | `/api/messages/upload-file` | `verifyToken` | — | Multer `upload.single("file")` — field name is `"file"`. Max 10MB. Returns `{ filePath: "uploads/files/<timestamp>/<originalname>" }`. |

### Channels Domain (`/api/channels`)
*Router*: [ChannelRoutes.js](../server/routes/ChannelRoutes.js) | *Controller*: [ChannelController.js](../server/controllers/ChannelController.js)

| Method | Endpoint | Auth Guard | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/channels/create-channel` | `verifyToken` | — | Body: `{ nameOfChannel, members: [ObjectId] }`. Validates all member IDs exist. Sets `admin` to `req.userId`. Admin is NOT added to `members`. |
| `GET` | `/api/channels/get-user-channels` | `verifyToken` | — | Returns channels where `admin === userId OR members includes userId`, sorted by `updatedAt` descending. |
| `GET` | `/api/channels/get-channel-messages/:channelId` | `verifyToken` | — | Populates `channel.messages` with sender details. Checks `channel.members.some(m => m.toString() === req.userId) OR channel.admin.toString() === req.userId`. Returns 403 if neither. |

### Health Domain
*Defined in*: [server/index.js L78–80](../server/index.js#L78-L80)

| Method | Endpoint | Auth Guard | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | Returns `{ status: "ok", timestamp: ISO8601 }`. Does **not** check DB connectivity — this is a liveness probe only. |

---

## 3. Deep-Dive Payloads for Core Routes

### Route 1: User Login (`POST /api/auth/login`)

#### Request
```http
POST /api/auth/login HTTP/1.1
Host: chatx-backend.onrender.com
Content-Type: application/json
Origin: https://chat-x-three-gamma.vercel.app

{
  "email": "alex.chen@example.com",
  "password": "Password123!"
}
```

#### Success (`200 OK`)
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Set-Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Max-Age=259200; Path=/; Expires=Sun, 06 Oct 2026 04:57:19 GMT; HttpOnly; Secure; SameSite=None

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
> Note: `image` and `color` are **not** returned by `login`. Only `user-info` returns `image`. Login response matches exactly what `AuthController.login` returns at [L104–112](../server/controllers/AuthController.js#L104-L112).

#### Failure Responses (actual response bodies as sent by the controller)
```
400 — "Email and Password are required"     (missing field)
400 — "Password is not correct"             (wrong password)
404 — "User with the given email not found." (no account)
429 — { "error": "Too many authentication attempts, please try again later." }
500 — "Internal server error"
```

---

### Route 2: Retrieve Direct Messages (`POST /api/messages/get-messages`)

#### Request
```http
POST /api/messages/get-messages HTTP/1.1
Host: chatx-backend.onrender.com
Content-Type: application/json
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "id": "670c5f9d2f8a1e0087654321"
}
```

#### Success (`200 OK`) — messages exist
```json
{
  "storedMessages": [
    {
      "_id": "670c604a2f8a1e0099887766",
      "sender": "670c5e7b2f8a1e0012345678",
      "recipient": "670c5f9d2f8a1e0087654321",
      "messageType": "text",
      "content": "Hey, are the deployment configs ready?",
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

#### Success (`200 OK`) — no messages
```json
{ "messages": [] }
```
> Note: The response key differs depending on whether messages exist. When `storedMessages.length === 0`, the controller returns `{ messages: [] }`. When messages exist, it returns `{ storedMessages: [...] }`. This is an API inconsistency in [MessagesController.js L24–33](../server/controllers/MessagesController.js#L24-L33).

#### Failure Responses
```
400 — "Both user IDs are required"       (missing id in body)
401 — "You are not authenticated, login or signup first!"
403 — "Token is not valid"
500 — "Could not fetch messages"
```

---

### Route 3: Create Channel (`POST /api/channels/create-channel`)

#### Request
```http
POST /api/channels/create-channel HTTP/1.1
Host: chatx-backend.onrender.com
Content-Type: application/json
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "nameOfChannel": "platform-engineering",
  "members": [
    "670c5f9d2f8a1e0087654321",
    "670c611a2f8a1e0055443322"
  ]
}
```

#### Success (`201 Created`)
```json
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
> Note: The `admin` (`req.userId`) is **not** included in the `members` array. The admin is a separate field. Channel message broadcasts explicitly loop `members` and then separately notify `admin` ([socket.js L136–156](../server/socket.js#L136-L156)).

#### Failure Responses
```
400 — "admin user not found"           (req.userId not in DB — should not occur with valid JWT)
400 — "Some users are not valid users"  (one or more member IDs do not exist)
401 — "You are not authenticated, login or signup first!"
500 — "Could not create channel"
```

---

## 4. Real-Time WebSocket Event Contract

*Engine*: [socket.js](../server/socket.js) | Socket.IO v4.8.1

### Authentication
All socket connections must pass JWT verification in `io.use()`. The JWT is extracted from `socket.handshake.headers.cookie` by splitting on `";"` and finding the `"jwt="` prefix. Connections without a valid token are rejected before `io.on("connection")` fires.

### Event: `sendMessage` (Client → Server)
```json
{
  "recipient": "670c5f9d2f8a1e0087654321",
  "content": "Reviewing the PR now.",
  "messageType": "text",
  "fileUrl": null
}
```
> The `sender` field is **ignored if provided by the client**. It is always overwritten with `socket.userId` server-side.

### Event: `recieveMessage` (Server → Client, both sender and recipient)
> Note: The event name contains a typo — `"recieveMessage"` (not `"receiveMessage"`). This is intentional in the codebase and must be matched exactly on the client.

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
  "content": "Reviewing the PR now.",
  "fileUrl": null,
  "timestamp": "2026-10-03T04:56:10.000Z"
}
```
> Sender and recipient are populated with `"id email firstName lastName image color"` — Mongoose's virtual `id` field (not `_id`).

### Event: `send-channel-message` (Client → Server)
```json
{
  "channelId": "670c62002f8a1e0011223344",
  "content": "v1.2.0 deployed to staging.",
  "messageType": "text",
  "fileUrl": null
}
```

### Event: `recieve-channel-message` (Server → Client, all members + admin)
> Note: Also contains the same `"recieve"` typo. Broadcast to all `channel.members` socket IDs **and** separately to `channel.admin` socket ID.

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
  "content": "v1.2.0 deployed to staging.",
  "fileUrl": null,
  "timestamp": "2026-10-03T04:57:00.000Z"
}
```
> **Inconsistency**: `recieveMessage` (DM) populates sender with `id` (virtual field). `recieve-channel-message` populates sender with `_id` (actual BSON field) because the select string in socket.js for DMs is `"id email firstName lastName image color"` while for channel messages it is also `"id email firstName lastName image color"` — however the spread `{ ...messageData._doc, channelId }` re-serializes the raw `_doc` which exposes `_id` instead of the virtual `id`. This is an API inconsistency between the two event payloads.
