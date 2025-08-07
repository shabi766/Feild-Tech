import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FilePlus, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for classnames

const Attachments = ({ attachments, onAttachmentChange, onRemoveAttachment }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    onAttachmentChange(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    onAttachmentChange(files);
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentChange(newAttachments);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-800">
        Attachments
      </h3>
      <p className="text-sm text-gray-500">
        Add any relevant documents, resumes, or images to support your submission.
      </p>
      
      {/* Drag and Drop Zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FilePlus className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-600 font-medium">
          Drag and drop files here
        </p>
        <p className="text-gray-400 text-sm mt-1">
          or
        </p>
        <Label
          htmlFor="attachment-input"
          className="mt-3 cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 transition-colors"
        >
          <FilePlus className="h-4 w-4 mr-2" />
          Browse Files
        </Label>
        <input
          type="file"
          id="attachment-input"
          multiple
          onChange={handleFileChange}
          className="sr-only" // This hides the native input but keeps it accessible
        />
      </div>

      {/* List of Attached Files */}
      {attachments && attachments.length > 0 && (
        <div className="space-y-3">
          <Label className="text-md font-semibold text-gray-700">Attached Files:</Label>
          <ul className="divide-y divide-gray-200 border rounded-lg bg-white shadow-sm">
            {attachments.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-800">{file.name}</span>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Attachments;