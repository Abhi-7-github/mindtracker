# POLO AI — Backend Services

Production-ready Node.js & Express backend for POLO AI. Features real-time WebRTC video/audio call signaling with Socket.IO, AI voice transcription with OpenAI Whisper, automated mental health & wellness assessment with GPT-5.1, secure cookie-based JWT authentication, and MongoDB object data modeling.

---

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Project Architecture](#-project-architecture)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Routes & Endpoints](#-api-routes--endpoints)
  - [Health Check](#health-check)
  - [Authentication & User Management (`/api/auth`)](#authentication--user-management-apiauth)
  - [AI Mental Health & Voice Check-in (`/api/ai`)](#ai-mental-health--voice-check-in-api-ai)
- [Real-time WebRTC Signaling (Socket.IO)](#-real-time-webrtc-signaling-socketio)
- [Database Models](#-database-models)
- [Middlewares & Utilities](#-middlewares--utilities)
- [Third-Party Integrations](#-third-party-integrations)
- [cURL Request Examples](#-curl-request-examples)

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+ with native ES Modules)
- **Framework**: Express.js (v4)
- **Real-Time Communication**: Socket.IO (WebRTC signaling)
- **Database**: MongoDB with Mongoose ODM (v7)
- **AI Models**: 
  - OpenAI Whisper (`whisper-1`) for speech-to-text audio transcription
  - OpenAI GPT (`gpt-5.1`) for emotion & mental wellness analysis
- **Security & Utilities**:
  - `bcryptjs` for salted password hashing
  - `jsonwebtoken` (JWT) with HTTP-only cookie delivery
  - `helmet` for HTTP security headers
  - `express-rate-limit` for API rate limiting
  - `express-validator` for request payload validation
  - `multer` for multipart form data & audio file handling
  - `cloudinary` for cloud media storage configuration
  - `morgan` for HTTP request logging

---

## 🔥 Key Features

1. **Secure Authentication & Role-Based Access Control**:
   - HTTP-only cookie-based JWT session management.
   - Salted password hashing (bcrypt, 10 rounds).
   - Multi-role user permissions (`user`, `psychologist`, `admin`).
   - Profile management and secure password change workflows.

2. **AI Voice Check-in & Mental Health Analytics**:
   - Multi-part voice recording upload (`multer` handling temporary file storage and cleanup).
   - Audio-to-text transcription via OpenAI Whisper API.
   - AI emotion & stress level analysis via OpenAI GPT-5.1:
     - Emotion tracking (primary and secondary emotions).
     - Quantitative scores (Stress, Anxiety, Burnout, Overall Wellness: 0–100).
     - Automated journal summary generation.
     - Personalized wellness plans & therapist recommendation logic.
     - Real-time crisis detection indicators.
     - Automated disclaimer injection for medical safety compliance.
   - Automated creation of `Journal` and `AISession` database records.

3. **Real-time WebRTC Video Call Signaling**:
   - Event-driven Socket.IO server for peer-to-peer WebRTC video/audio sessions.
   - Room creation and host assignment (`create-room`, `room-created`).
   - Peer discovery and room joining (`join-room`, `peer-joined`).
   - Full WebRTC negotiation relay: SDP offers (`offer`), SDP answers (`answer`), and ICE candidate exchange (`ice-candidate`).
   - Peer disconnection and room teardown handling (`leave-room`, `peer-left`, `disconnect`).

4. **Security & Production Best Practices**:
   - Global rate limiting (200 requests per 15 minutes per IP).
   - Strict CORS configuration bound to `CLIENT_URL` with credentials support.
   - Helmet HTTP header security protections.
   - Global error handler catching unhandled exceptions and standardizing JSON error outputs.
   - Request validation middleware checking inputs before controller execution.
   - Dynamic database connection monitoring with Mongoose lifecycle event listeners.

---

## 📁 Project Architecture

```
backend/
├── src/
│   ├── app.js               # Express application initialization & middleware setup
│   ├── server.js            # HTTP server launch, Socket.IO setup, DB initialization
│   ├── config/
│   │   ├── db.js            # MongoDB connection logic & connection state monitor
│   │   └── cloudinary.js    # Cloudinary v2 SDK configuration
│   ├── controllers/
│   │   ├── aiController.js   # Voice check-in, transcription, & analysis handlers
│   │   └── authController.js # Auth registration, login, profile, password handlers
│   ├── middleware/
│   │   ├── asyncHandler.js   # Wrapper for async route controllers
│   │   ├── authMiddleware.js # requireAuth & requireRole middleware
│   │   ├── errorHandler.js   # Centralized error response handler
│   │   └── validate.js       # express-validator error catcher
│   ├── models/
│   │   ├── AISession.js      # Schema for stored AI analysis & session data
│   │   ├── Appointment.js    # Schema for therapy sessions between users & psychologists
│   │   ├── Journal.js        # Schema for AI-generated & manual user journals
│   │   ├── Notification.js   # Schema for system & appointment notifications
│   │   └── User.js           # User account schema with password hashing methods
│   ├── routes/
│   │   ├── aiRoutes.js       # Endpoints for AI features (/api/ai)
│   │   └── authRoutes.js     # Endpoints for authentication (/api/auth)
│   ├── services/
│   │   ├── authService.js    # Business logic for auth, passwords, and user profiles
│   │   └── openaiService.js  # OpenAI API calls (Whisper transcription & GPT analysis)
│   ├── socket/
│   │   └── signaling.js      # Socket.IO event handlers for WebRTC P2P connection
│   ├── utils/
│   │   └── response.js       # Standardized response helper utilities
│   └── validators/
│       └── authValidators.js # Validation rules for auth routes
├── .env                     # Local environment variables
├── .env.example             # Example environment configuration
├── package.json             # Node dependencies and npm scripts
└── README.md                # Backend documentation
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` root directory based on `.env.example`:

| Environment Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port number for the HTTP & Socket server | `3000` or `5000` |
| `MONGO_URI` | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://localhost:27017/mindbridge` |
| `JWT_SECRET` | Secret key used for signing JWT auth tokens | `supersecretkey` |
| `JWT_EXPIRES` | JWT token duration | `7d` |
| `CLIENT_URL` | Allowed CORS origin for the frontend application | `http://localhost:5173` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `OPENAI_API_KEY` | OpenAI API key (required for Whisper and GPT analysis) | `sk-...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier (optional) | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key (optional) | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (optional) | `your_api_secret` |

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env and supply your MONGO_URI, JWT_SECRET, and OPENAI_API_KEY
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Production Server**:
   ```bash
   npm start
   ```

---

## 🌐 API Routes & Endpoints

### Health Check

- **`GET /health`**
  - **Description**: Verifies API operational status.
  - **Auth Required**: None
  - **Response**:
    ```json
    { "success": true, "message": "OK" }
    ```

---

### Authentication & User Management (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Register a new user account.
- **Auth Required**: None
- **Validation**:
  - `name`: Required string.
  - `email`: Required, must be a valid email format.
  - `password`: Required, minimum 6 characters.
  - `role`: Optional (`user`, `psychologist`, `admin`; defaults to `user`).
- **Response**: Sets an HTTP-only `token` cookie (valid 7 days).
  ```json
  {
    "success": true,
    "message": "Registered",
    "data": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": null
    }
  }
  ```

#### `POST /api/auth/login`
- **Description**: Authenticate an existing user.
- **Auth Required**: None
- **Body**: `{ "email": "jane@example.com", "password": "password123" }`
- **Response**: Sets HTTP-only `token` cookie.
  ```json
  {
    "success": true,
    "message": "Logged in",
    "data": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": null
    }
  }
  ```

#### `POST /api/auth/logout`
- **Description**: Clears the HTTP-only `token` authentication cookie.
- **Auth Required**: None
- **Response**:
  ```json
  { "success": true, "message": "Logged out" }
  ```

#### `GET /api/auth/me`
- **Description**: Fetch profile details of the currently authenticated user.
- **Auth Required**: Yes (`token` cookie)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "bio": "Mental health advocate",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2026-08-01T10:00:00.000Z"
    }
  }
  ```

#### `PUT /api/auth/profile`
- **Description**: Update user profile information.
- **Auth Required**: Yes (`token` cookie)
- **Body**: `{ "name": "Jane Smith", "bio": "Updated bio text", "avatar": "https://example.com/new-avatar.jpg" }`
- **Allowed Fields**: `name`, `bio`, `avatar`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile updated",
    "data": { ...updatedUser }
  }
  ```

#### `POST /api/auth/change-password`
- **Description**: Change password for the logged-in user.
- **Auth Required**: Yes (`token` cookie)
- **Body**: `{ "currentPassword": "oldpassword123", "newPassword": "newsecretpassword123" }`
- **Validation**: `newPassword` minimum length 6.
- **Response**:
  ```json
  { "success": true, "message": "Password changed" }
  ```

---

### AI Mental Health & Voice Check-in (`/api/ai`)

#### `POST /api/ai/voice-checkin`
- **Description**: Upload a voice recording for AI processing. The server transcribes the audio with OpenAI Whisper, analyzes emotional state and mental health indicators with OpenAI GPT-5.1, creates an AI journal entry, and logs an `AISession`.
- **Auth Required**: Yes (`token` cookie)
- **Content-Type**: `multipart/form-data`
- **Form Field**: `audio` (audio file e.g., `.wav`, `.mp3`, `.m4a`, `.webm`)
- **Response**:
  ```json
  {
    "success": true,
    "message": "AI analysis complete",
    "data": {
      "sessionId": "64f1a2b3c4d5e6f7a8b9c0e2",
      "transcript": "I felt overwhelmed with work deadlines today...",
      "analysis": {
        "primaryEmotion": "Anxious",
        "secondaryEmotion": "Exhausted",
        "stressScore": 75,
        "anxietyScore": 68,
        "burnoutScore": 60,
        "wellnessScore": 45,
        "dailyJournal": "Today was challenging with heavy workload pressure...",
        "wellnessSummary": "High stress detected driven by work deadlines.",
        "wellnessPlan": {
          "recommendations": ["Take 10-minute breathing breaks", "Limit caffeine intake after 2 PM"]
        },
        "psychologistRecommendation": "Recommended to schedule a consultation if feeling persists for over 2 weeks.",
        "crisisDetection": false,
        "disclaimer": "This assessment is AI-generated and should not be considered medical advice."
      },
      "journalId": "64f1a2b3c4d5e6f7a8b9c0e1"
    }
  }
  ```

---

## ⚡ Real-time WebRTC Signaling (Socket.IO)

The backend provides a full WebRTC signaling channel via Socket.IO for initiating peer-to-peer audio/video calls.

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `create-room` | Client → Server | `roomId` (string) | Host creates a room. Registers host and joins socket channel. |
| `room-created` | Server → Client | `roomId` (string) | Confirms room creation back to creator socket. |
| `join-room` | Client → Server | `roomId` (string) | Participant joins room. Server notifies room members. |
| `peer-joined` | Server → Client | `peerId` (string) | Emitted to existing room participants when a new peer joins. |
| `offer` | Client → Server → Client | `{ to: socketId, offer: sdp }` | Relays WebRTC SDP Offer to target peer. |
| `answer` | Client → Server → Client | `{ to: socketId, answer: sdp }` | Relays WebRTC SDP Answer to target peer. |
| `ice-candidate` | Client → Server → Client | `{ to: socketId, candidate }` | Relays WebRTC ICE candidate trickling to target peer. |
| `leave-room` | Client → Server | `roomId` (string) | Leaves specified room and broadcasts `peer-left` to remaining peers. |
| `peer-left` | Server → Client | `peerId` (string) | Notifies remaining room members when a peer leaves or disconnects. |
| `disconnect` | Internal Event | — | Automatically cleans up room tracking and notifies peers when connection drops. |

---

## 🗄 Database Models

### `User`
- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, hashed via bcrypt)
- `role` (String, enum: `['user', 'psychologist', 'admin']`, default: `'user'`)
- `bio` (String)
- `avatar` (String URL)
- `createdAt` (Date, default: `Date.now`)

### `AISession`
- `user` (ObjectId ref `User`, required)
- `transcript` (String)
- `analysis` (Mixed Object containing scores, emotions, plan, & crisis flag)
- `journalId` (ObjectId ref `Journal`)
- `wellnessPlan` (Mixed Object)
- `createdAt` (Date, default: `Date.now`)

### `Journal`
- `user` (ObjectId ref `User`, required)
- `title` (String)
- `content` (String)
- `generatedByAI` (Boolean, default: `true`)
- `createdAt` (Date, default: `Date.now`)

### `Appointment`
- `user` (ObjectId ref `User`, required)
- `psychologist` (ObjectId ref `User`, required)
- `date` (Date, required)
- `duration` (Number in minutes, default: `50`)
- `status` (String, enum: `['Pending', 'Confirmed', 'Completed', 'Cancelled']`, default: `'Pending'`)
- `meetingId` (String, required, indexed)
- `createdAt` (Date, default: `Date.now`)

### `Notification`
- `user` (ObjectId ref `User`, required)
- `type` (String, required)
- `title` (String)
- `body` (String)
- `read` (Boolean, default: `false`)
- `meta` (Mixed Object)
- `createdAt` (Date, default: `Date.now`)

---

## 🛡 Middlewares & Utilities

- **`authMiddleware`**:
  - `requireAuth`: Reads `req.cookies.token`, verifies JWT, and attaches user payload to `req.user`.
  - `requireRole(...roles)`: Verifies `req.user.role` matches allowed roles (returns 403 Forbidden otherwise).
- **`validate`**: Evaluates `express-validator` result set. If errors exist, returns 400 Bad Request with error details.
- **`asyncHandler`**: High-order function wrapping async route handlers to pass unhandled rejections to `next(err)`.
- **`errorHandler`**: Centralized Express error handler returning formatted `{ success: false, message, errors }` responses.
- **`response.js`**: Helper functions `success(res, message, data)` and `error(res, status, message, errors)` for standardized responses.

---

## 🔌 Third-Party Integrations

### OpenAI Integration (`src/services/openaiService.js`)
- **`transcribeAudio(filePath)`**: Uses OpenAI `whisper-1` model to convert audio uploads to transcript text.
- **`analyzeConversation(transcript)`**: Prompts OpenAI `gpt-5.1` with a structured system prompt requesting JSON output containing emotion metrics, stress/anxiety scores, journal text, wellness plans, and crisis warnings.

### Cloudinary Integration (`src/config/cloudinary.js`)
- Cloudinary v2 SDK configuration supporting cloud storage for user avatar images and uploaded media.

---

## 💻 cURL Request Examples

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. User Registration (saves token cookie to cookies.txt)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}' \
  -c cookies.txt

# 3. User Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}' \
  -c cookies.txt

# 4. Get Current User Profile (using saved cookie)
curl http://localhost:3000/api/auth/me -b cookies.txt

# 5. Update Profile
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","bio":"Wellness enthusiast"}' \
  -b cookies.txt

# 6. Change Password
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"password123","newPassword":"newsecretpassword123"}' \
  -b cookies.txt

# 7. Upload Voice Check-in Audio File for AI Processing
curl -X POST http://localhost:3000/api/ai/voice-checkin \
  -b cookies.txt \
  -F "audio=@/path/to/voice_checkin.wav"

# 8. User Logout (clears cookie)
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

