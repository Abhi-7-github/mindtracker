# MindBridge AI - Backend

Backend for MindBridge AI. Configure `.env` from `.env.example`, then run:

```bash
cd backend
npm install
npm run dev
```

Exposes: REST API + Socket.IO signaling.

**Required environment variables**
- `MONGO_URI` - MongoDB connection string
- `OPENAI_API_KEY` - OpenAI API key (used for transcription and analysis)
- `JWT_SECRET` - Secret for signing auth tokens
- `CLIENT_URL` - Frontend origin for CORS
- `NODE_ENV` - `development` or `production`

**Health check**
- `GET /health` — returns { success: true, message: 'OK' }

**API Routes**

Base path prefixes used by the app:
- Auth routes: `/api/auth`
- AI routes: `/api/ai`

**Auth Routes** (`/api/auth`)

- `POST /register`
	- Description: Register a new user.
	- Body (application/json): { name, email, password[, role] }
	- Validation: `name` required, `email` must be valid, `password` min length 6
	- Response: sets an HTTP-only cookie `token`, returns `{ success: true, message: 'Registered', data: user }`

- `POST /login`
	- Description: Login an existing user.
	- Body (application/json): { email, password }
	- Response: sets cookie `token`, returns `{ success: true, message: 'Logged in', data: user }`

- `POST /logout`
	- Description: Clears the auth cookie.
	- Response: `{ success: true, message: 'Logged out' }`

- `GET /me`
	- Description: Get the current authenticated user.
	- Auth: requires cookie `token` (see auth middleware)
	- Response: `{ success: true, message: 'Success', data: user }`

- `PUT /profile`
	- Description: Update profile fields.
	- Auth: requires cookie `token`
	- Body: allowed fields include `name`, `bio`, `avatar`
	- Response: `{ success: true, message: 'Profile updated', data: user }`

- `POST /change-password`
	- Description: Change user password.
	- Auth: requires cookie `token`
	- Body: { currentPassword, newPassword } (`newPassword` min length 6)
	- Response: `{ success: true, message: 'Password changed' }`

Example: register, login and use cookie with curl

```bash
# Register (saves cookie to cookies.txt)
curl -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Alice","email":"alice@example.com","password":"secret123"}' \
	-c cookies.txt

# Login (saves cookie)
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret123"}' \
	-c cookies.txt

# Use authenticated endpoint with saved cookie
curl http://localhost:3000/api/auth/me -b cookies.txt
```

**AI Routes** (`/api/ai`)

- `POST /voice-checkin`
	- Description: Upload a short voice check-in audio file. The backend transcribes the audio with OpenAI, runs analysis, creates a journal and an AI session record.
	- Auth: requires cookie `token`
	- Content-Type: `multipart/form-data`
	- Form field: `audio` — the audio file to upload
	- Response: `{ success: true, message: 'AI analysis complete', data: { sessionId, transcript, analysis, journalId } }`

Example: upload audio using curl (authenticated)

```bash
curl -X POST http://localhost:3000/api/ai/voice-checkin \
	-b cookies.txt \
	-F "audio=@/path/to/checkin.wav"
```

Notes & implementation details
- Auth is cookie-based: the server sets a `token` cookie on successful login/register. Protected routes use the `requireAuth` middleware which reads `req.cookies.token`.
- Validation is performed with `express-validator` and the `validate` middleware — bad requests return 4xx with validation errors.
- AI transcription uses the `openai` client: `transcribeAudio(filePath)` and `analyzeConversation(transcript)` in `src/services/openaiService.js`.
- Uploaded audio files are stored temporarily (OS temp) and removed after processing.

If you'd like, I can also add Postman collections or a short examples file with more request/response samples.
