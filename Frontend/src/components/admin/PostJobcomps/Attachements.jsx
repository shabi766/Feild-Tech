import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FilePlus, X } from 'lucide-react';

const Attachments = ({ attachments, onAttachmentChange, onRemoveAttachment }) => {
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        onAttachmentChange(files); // Call the prop function to update parent state
    };

    const handleRemoveAttachment = (index) => {
        // Create a new array excluding the removed attachment
        const newAttachments = attachments.filter((_, i) => i !== index);
        onAttachmentChange(newAttachments); // Call the prop function with the updated array
    };

    return (
        <div>
            
            <div className="mb-4">
                <Label htmlFor="attachment" className="block mb-2">Attach Files (Documents, Images, etc.)</Label>
                <input
                    type="file"
                    id="attachment"
                    multiple
                    onChange={handleFileChange}
                    className="w-full border rounded-md py-2 px-3"
                />
            </div>

            {attachments && attachments.length > 0 && (
                <div>
                    <Label className="block mb-2">Attached Files:</Label>
                    <ul>
                        {attachments.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-2 border-b">
                                <span>{file.name} ({formatFileSize(file.size)})</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleRemoveAttachment(index)}
                                >
                                    <X className="h-4 w-4" /> Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Attachments;