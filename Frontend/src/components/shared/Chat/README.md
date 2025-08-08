# Chat UI Components

## Overview
Modern, responsive chat interface with real-time messaging, file sharing, and enhanced user experience.

## Components

### 1. `chat.jsx` (Main Component)
- **Purpose**: Main orchestrator component that manages the chat layout
- **Features**:
  - Responsive design with mobile sidebar toggle
  - ChatProvider context wrapper
  - Smooth transitions and overlays

### 2. `ChatSidebar.jsx`
- **Purpose**: Displays chat list and user search functionality
- **Features**:
  - Modern gradient header with action buttons
  - User search with suggestions dropdown
  - Chat list with unread message badges
  - Online status indicators
  - Last message preview and timestamp
  - Hover actions (call, video call, delete)
  - Empty state with helpful messaging

### 3. `ChatWindow.jsx`
- **Purpose**: Main chat interface for messaging
- **Features**:
  - Clean header with user info and status
  - Message bubbles with proper alignment
  - Typing indicators
  - Message timestamps and read status
  - File attachment support
  - Emoji picker placeholder
  - Enter key to send messages
  - Auto-scroll to latest messages

### 4. `ChatMessage.jsx`
- **Purpose**: Individual message component
- **Features**:
  - Support for different file types (images, videos, audio, documents)
  - File preview and download functionality
  - Message status indicators (sent, delivered, read)
  - Delete message functionality
  - Hover actions
  - Responsive design

### 5. `ChatFileUpload.jsx`
- **Purpose**: File upload modal with drag & drop
- **Features**:
  - Drag and drop file upload
  - File type validation
  - File size limits (10MB)
  - Multiple file selection
  - File preview with icons
  - Progress indicators

### 6. `ChatSearch.jsx`
- **Purpose**: Search functionality for chats and messages
- **Features**:
  - Real-time search
  - Search suggestions
  - Keyboard navigation

### 7. `ChatLoading.jsx`
- **Purpose**: Loading states for chat operations
- **Features**:
  - Skeleton loading
  - Spinner animations

### 8. `ChatHeader.jsx`
- **Purpose**: Chat header component (legacy)
- **Status**: Deprecated in favor of inline header in ChatWindow

## Features

### 🎨 **Modern Design**
- Clean, minimalist interface
- Consistent color scheme (indigo/purple gradient)
- Smooth animations and transitions
- Responsive design for all screen sizes

### 💬 **Messaging**
- Real-time message delivery
- Message status indicators
- Typing indicators
- Message timestamps
- Delete message functionality
- Message grouping by sender

### 📁 **File Sharing**
- Drag and drop file upload
- Multiple file types support
- File preview and download
- File size validation
- Progress indicators

### 🔍 **Search & Navigation**
- User search with suggestions
- Chat search functionality
- Keyboard shortcuts
- Mobile-friendly navigation

### 📱 **Responsive Design**
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interactions
- Optimized for all screen sizes

### ⚡ **Performance**
- Efficient message rendering
- Lazy loading for large chat histories
- Optimized re-renders
- Smooth scrolling

## Usage

```jsx
import Chat from '@/components/shared/Chat/chat';

function App() {
  return (
    <div className="h-screen">
      <Chat />
    </div>
  );
}
```

## Styling

The chat uses Tailwind CSS with custom components from shadcn/ui:
- `Button` - Action buttons
- `Input` - Text inputs
- `Avatar` - User avatars
- `Badge` - Unread message counters

## Context

The chat uses `ChatContext` for state management:
- Chat list and selected chat
- Messages and real-time updates
- User status and online indicators
- Unread message tracking

## Socket Integration

Real-time features powered by Socket.IO:
- Live message delivery
- Typing indicators
- Online status updates
- Message read receipts

## File Upload

Files are uploaded to S3 and integrated with the chat system:
- Automatic file type detection
- Preview generation
- Download functionality
- File size validation

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management
- ARIA labels and descriptions
