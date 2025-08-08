# Audio Call Feature

## Overview
The audio call feature allows users to make real-time voice calls with other users in the chat system. It uses WebRTC for peer-to-peer communication and Socket.IO for signaling.

## Features

### ✅ Implemented
- **Audio Call Initiation**: Click the phone icon in chat sidebar or header to start a call
- **Incoming Call Notifications**: Toast notifications with accept/decline options
- **Call Controls**: Mute/unmute, speaker on/off, end call
- **Real-time Audio**: WebRTC peer-to-peer audio streaming
- **Call Status**: Visual indicators for incoming, outgoing, and active calls
- **Ringtone**: Audio feedback for incoming calls

### 🚧 Coming Soon
- **Video Calls**: Video call functionality (currently shows "coming soon" message)
- **Call History**: Track and display call history
- **Call Duration**: Display call duration timer
- **Group Calls**: Support for multiple participants

## How It Works

### 1. Call Initiation
- User clicks phone icon in chat sidebar or header
- System requests microphone permissions
- Call request sent via Socket.IO to recipient
- Recipient receives toast notification

### 2. Call Acceptance/Rejection
- Recipient can accept or decline via toast notification
- If accepted, WebRTC connection is established
- If declined, call ends immediately

### 3. Audio Communication
- WebRTC peer connection handles audio streaming
- ICE candidates exchanged for NAT traversal
- Audio tracks added to peer connection
- Real-time bidirectional audio communication

### 4. Call Controls
- **Mute/Unmute**: Toggle local microphone
- **Speaker**: Toggle remote audio output
- **End Call**: Terminate the call

## Technical Implementation

### Frontend Components
- `AudioCallContext.jsx`: Manages call state and WebRTC logic
- `AudioCallModal.jsx`: UI for call interface
- `ChatSidebar.jsx`: Call initiation from sidebar
- `ChatWindow.jsx`: Call initiation from chat header

### Backend Socket Events
- `audio_call_request`: Initiate call
- `audio_call_accepted`: Accept call
- `audio_call_rejected`: Reject call
- `audio_call_ended`: End call
- `audio_call_offer`: WebRTC offer
- `audio_call_answer`: WebRTC answer
- `audio_call_ice_candidate`: ICE candidate exchange

### WebRTC Configuration
```javascript
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};
```

## Usage

### Making a Call
1. Open a chat conversation
2. Click the phone icon (📞) in the chat header or sidebar
3. Grant microphone permissions when prompted
4. Wait for recipient to accept

### Receiving a Call
1. You'll see a toast notification for incoming calls
2. Click "Answer" to accept or "Decline" to reject
3. Grant microphone permissions if accepting

### During a Call
- Use the mute button to toggle your microphone
- Use the speaker button to toggle remote audio
- Click the red phone button to end the call

## Browser Compatibility
- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

## Requirements
- HTTPS connection (required for getUserMedia)
- Microphone permissions
- Modern browser with WebRTC support

## Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions
2. **No audio**: Ensure speaker is not muted
3. **Call not connecting**: Check network connectivity
4. **Permission denied**: Allow microphone access in browser settings

### Debug Information
- Check browser console for WebRTC errors
- Verify Socket.IO connection status
- Ensure STUN servers are accessible
