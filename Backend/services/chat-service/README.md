# Chat Service

Real-time chat and messaging microservice for ShiftMate. Handles instant messaging, file sharing, and audio calls.

## Features

- Real-time messaging via Socket.io
- One-on-one and group chats
- File uploads (images, videos, documents)
- Message read receipts
- Audio call support (WebRTC signaling)
- User online/offline status
- Chat search functionality
- Integration with Auth Service for user data

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secret key (must match other services)
   - Auth Service URL
   - AWS S3 credentials (for file uploads)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8005 by default (configurable via `CHAT_SERVICE_PORT`).

## API Endpoints

### Chat Management

- `GET /api/v1/chat/all` - Get all chats for authenticated user
- `POST /api/v1/chat/create` - Create a new chat (one-on-one or group)
- `GET /api/v1/chat/:chatId` - Get messages for a chat
- `DELETE /api/v1/chat/chat/:chatId` - Delete a chat
- `GET /api/v1/chat/search` - Search chats

### Messaging

- `POST /api/v1/chat/send` - Send a message
- `DELETE /api/v1/chat/message/:messageId` - Delete a message
- `POST /api/v1/chat/mark-as-read` - Mark messages as read
- `GET /api/v1/chat/unread-messages` - Get unread messages

### File Operations

- `POST /api/v1/chat/upload-file` - Upload file for chat

### Health Check

- `GET /health` - Service health check

## Socket.io Events

### Client → Server Events

- `authenticate` - Authenticate socket connection with JWT token
- `joinRoom` - Join user's room (for status updates)
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `setAway` - Set user status to away
- `audio_call_request` - Request audio call
- `audio_call_accepted` - Accept audio call
- `audio_call_rejected` - Reject audio call
- `audio_call_ended` - End audio call
- `audio_call_offer` - Send WebRTC offer
- `audio_call_answer` - Send WebRTC answer
- `audio_call_ice_candidate` - Send ICE candidate

### Server → Client Events

- `new_message` - New message received
- `message_deleted` - Message deleted
- `chat_deleted` - Chat deleted
- `update_status` - User status updated (online/offline/away)
- `audio_call_request` - Incoming audio call
- `audio_call_accepted` - Call accepted
- `audio_call_rejected` - Call rejected
- `audio_call_ended` - Call ended
- `audio_call_offer` - WebRTC offer received
- `audio_call_answer` - WebRTC answer received
- `audio_call_ice_candidate` - ICE candidate received

## Database

The Chat Service uses the same MongoDB database as the main application during migration.
The Chat model stores IDs only (no MongoDB refs) for cross-service references.

## Model Structure

The Chat model stores:
- Chat-specific data (participants, messages, group info)
- Message data (sender, content, type, fileUrl, read status)
- IDs for participants and senders (no refs to User model)

## Integration with Other Services

### Auth Service
- Fetches user data for participants and message senders
- Uses `AuthServiceClient` for HTTP calls
- User status updates (TODO: Add endpoint to Auth Service)

## Socket.io Connection

### Frontend Connection

Update frontend Socket.io connection to point to Chat Service:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:8005", {
    withCredentials: true,
    transports: ["websocket", "polling"]
});

// Authenticate after connection
socket.emit("authenticate", token);
```

## Migration Notes

- Socket.io server moved from main backend to Chat Service
- User status updates currently handled in Chat Service (will migrate to Auth Service)
- All user data fetched via Auth Service HTTP calls
- No direct model imports from other services
- Real-time messaging fully functional via Socket.io

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Service won't start
- Check if port 8005 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Socket.io connection fails
- Verify frontend is connecting to correct port (8005)
- Check CORS configuration
- Ensure JWT token is valid

### Auth Service connection fails
- Verify `AUTH_SERVICE_URL` is correct
- Ensure Auth Service is running on port 8001
- Check network connectivity

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings
