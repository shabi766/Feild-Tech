import React, { useState, useRef } from "react";
import { Paperclip, X, Image as ImageIcon, File, Music, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FileUpload = ({ onFileSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
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

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file) => {
        const type = file.type.split('/')[0];
        switch (type) {
            case 'image':
                return <ImageIcon size={20} className="text-blue-500" />;
            case 'video':
                return <File size={20} className="text-purple-500" />;
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

    const handleSendFiles = () => {
        if (selectedFiles.length > 0) {
            onFileSelect(selectedFiles);
            setSelectedFiles([]);
            setIsOpen(false);
        }
    };

    const handleCancel = () => {
        setSelectedFiles([]);
        setIsOpen(false);
    };

    return (
        <>
            <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={() => setIsOpen(true)}
            >
                <Paperclip size={16} />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Send Files</h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancel}
                                className="h-8 w-8 p-0"
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        {/* Drag and Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                dragActive 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Paperclip size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">
                                Drag and drop files here, or
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose Files
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files)}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                            />
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {getFileIcon(file)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
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
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendFiles}
                                disabled={selectedFiles.length === 0}
                                className="flex-1"
                            >
                                Send {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FileUpload;
