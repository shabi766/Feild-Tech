import React from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Textarea } from "../../ui/textarea";
import { Paperclip, X } from "lucide-react";

const CompletionForm = ({
    showCompletionForm,
    notes,
    deliverables,
    actionLoading,
    uploadLoading,
    onClose,
    onNotesChange,
    onFileUpload,
    onRemoveDeliverable,
    onSubmit,
    singleJob,
    fileInputRef
}) => {
    if (!showCompletionForm) return null;

    return (
        <Card className="mb-6 border-2 border-purple-200">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                        <span className="mr-2">✅</span>
                        Complete Work Order
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Notes Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Order Notes
                        {singleJob.completionRequirements?.notesRequired && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                    <Textarea
                        value={notes}
                        onChange={onNotesChange}
                        placeholder="Add notes about the completed work..."
                        className="min-h-[100px]"
                        required={singleJob.completionRequirements?.notesRequired}
                    />
                </div>

                {/* Deliverables Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deliverables (Images)
                        {singleJob.completionRequirements?.imagesRequired && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                    
                    {/* File Upload */}
                    <div className="flex items-center space-x-2 mb-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileUpload}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadLoading}
                            className="flex items-center space-x-2"
                        >
                            <Paperclip className="h-4 w-4" />
                            <span>{uploadLoading ? 'Uploading...' : 'Upload Images'}</span>
                        </Button>
                    </div>

                    {/* Display Uploaded Images */}
                    {deliverables.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {deliverables.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image}
                                        alt={`Deliverable ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    <button
                                        onClick={() => onRemoveDeliverable(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={actionLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {actionLoading ? 'Completing...' : 'Complete Work Order'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CompletionForm;
