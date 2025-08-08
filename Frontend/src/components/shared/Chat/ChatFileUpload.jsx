import React, { useRef, useState } from "react";
import { Paperclip, X, Image as ImageIcon, File, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ChatFileUpload = ({ onFileSelect, onClose }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileSelect = (files) => {
        const validFiles = Array.from(files).filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedFiles(validFiles);
            onFileSelect(validFiles);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const getFileIcon = (file) => {
        const type = file.type.split('/')[0];
        switch (type) {
            case 'image':
                return <ImageIcon size={20} className="text-blue-500" />;
            case 'video':
                return <Video size={20} className="text-purple-500" />;
            case 'audio':
                return <Music size={20} className="text-green-500" />;
            default:
                return <File size={20} className="text-gray-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Share Files</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X size={16} />
                    </Button>
                </div>

                {/* Drag and Drop Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                        Drag and drop files here, or{' '}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            browse
                        </button>
                    </p>
                    <p className="text-xs text-gray-500">
                        Maximum file size: 10MB
                    </p>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Selected Files ({selectedFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                >
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                        <X size={12} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => {
                            if (selectedFiles.length > 0) {
                                onFileSelect(selectedFiles);
                                onClose();
                            }
                        }}
                        disabled={selectedFiles.length === 0}
                    >
                        Send {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatFileUpload;
