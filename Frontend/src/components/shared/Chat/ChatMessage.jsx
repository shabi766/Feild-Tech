import React, { useState } from "react";
import { Trash2, Eye, CheckCircle, Download, Image as ImageIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const ChatMessage = ({ message, isCurrentUser, recipient, onDelete }) => {
    const [showActions, setShowActions] = useState(false);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getFileType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const videoTypes = ['mp4', 'avi', 'mov', 'wmv'];
        const audioTypes = ['mp3', 'wav', 'ogg'];
        
        if (imageTypes.includes(extension)) return 'image';
        if (videoTypes.includes(extension)) return 'video';
        if (audioTypes.includes(extension)) return 'audio';
        return 'file';
    };

    const renderMessageContent = () => {
        if (message.type === "file" && message.fileUrl) {
            const fileType = getFileType(message.fileUrl);
            
            switch (fileType) {
                case 'image':
                    return (
                        <div className="space-y-2">
                            <img 
                                src={message.fileUrl} 
                                alt="Shared image" 
                                className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.fileUrl, '_blank')}
                            />
                            {message.content && (
                                <p className="text-sm">{message.content}</p>
                            )}
                        </div>
                    );
                case 'video':
                    return (
                        <div className="space-y-2">
                            <video 
                                controls 
                                className="max-w-full max-h-64 rounded-lg"
                                src={message.fileUrl}
                            />
                            {message.content && (
                                <p className="text-sm">{message.content}</p>
                            )}
                        </div>
                    );
                case 'audio':
                    return (
                        <div className="space-y-2">
                            <audio controls className="w-full" src={message.fileUrl} />
                            {message.content && (
                                <p className="text-sm">{message.content}</p>
                            )}
                        </div>
                    );
                default:
                    return (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                <File size={20} className="text-gray-500" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {message.fileUrl.split('/').pop()}
                                    </p>
                                    <p className="text-xs text-gray-500">File</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(message.fileUrl, '_blank')}
                                    className="h-8 w-8 p-0"
                                >
                                    <Download size={16} />
                                </Button>
                            </div>
                            {message.content && (
                                <p className="text-sm">{message.content}</p>
                            )}
                        </div>
                    );
            }
        }
        
        return <p className="break-words text-sm leading-relaxed">{message.content}</p>;
    };

    return (
        <div
            className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar for other user */}
            {!isCurrentUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={recipient?.profile?.profilePhoto} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                        {recipient?.fullname?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}
            
            {/* Spacer for current user messages */}
            {isCurrentUser && <div className="w-8"></div>}
            
            {/* Message bubble */}
            <div className={`group relative max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                <div className={`relative p-3 rounded-2xl ${
                    isCurrentUser 
                        ? 'bg-indigo-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                }`}>
                    {renderMessageContent()}
                    
                    {/* Message time and status */}
                    <div className={`flex items-center justify-end gap-1 mt-2 ${
                        isCurrentUser ? 'text-indigo-100' : 'text-gray-400'
                    }`}>
                        <span className="text-xs">
                            {formatTime(message.createdAt)}
                        </span>
                        {isCurrentUser && (
                            <div className="flex items-center">
                                {message.isRead ? (
                                    <Eye size={12} className="text-green-300" />
                                ) : (
                                    <CheckCircle size={12} className="text-indigo-200" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Action buttons on hover */}
                {isCurrentUser && showActions && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => {
                            onDelete(message._id);
                            toast.success("Message deleted");
                        }}
                    >
                        <Trash2 size={10} />
                    </Button>
                )}
            </div>
            
            {/* Spacer for other user messages */}
            {!isCurrentUser && <div className="w-8"></div>}
        </div>
    );
};

export default ChatMessage;
