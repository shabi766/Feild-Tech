import React from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Paperclip, Image as ImageIcon } from "lucide-react";

const JobDetails = ({
    singleJob,
    isAssignedTechnician,
    notes,
    deliverables,
    uploadLoading,
    onNotesChange,
    onFileUpload,
    onSaveNotes,
    fileInputRef
}) => {
    return (
        <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">📄</span>
                        Job Description
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 leading-relaxed">{singleJob?.description}</p>
                </CardContent>
            </Card>

            {/* Skills & Requirements */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">🛠️</span>
                        Skills & Requirements
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {singleJob?.skills && singleJob.skills.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {singleJob.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {singleJob?.requiredTools && singleJob.requiredTools.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Required Tools</h4>
                            <div className="flex flex-wrap gap-2">
                                {singleJob.requiredTools.map((tool, index) => (
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                        {tool}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {singleJob?.experience && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Experience Required</h4>
                            <p className="text-gray-700">{singleJob.experience} years</p>
                        </div>
                    )}

                    {singleJob?.selectionRules && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Selection Criteria</h4>
                            <div className="space-y-2">
                                {singleJob.selectionRules.requiredDegrees && singleJob.selectionRules.requiredDegrees.length > 0 && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Required Degrees:</strong> {singleJob.selectionRules.requiredDegrees.join(', ')}
                                    </p>
                                )}
                                {singleJob.selectionRules.requiredCertifications && singleJob.selectionRules.requiredCertifications.length > 0 && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Required Certifications:</strong> {singleJob.selectionRules.requiredCertifications.join(', ')}
                                    </p>
                                )}
                                {singleJob.selectionRules.minimumExperience && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Minimum Experience:</strong> {singleJob.selectionRules.minimumExperience} years
                                    </p>
                                )}
                                {singleJob.selectionRules.mustHavePortfolio && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Portfolio Required:</strong> Yes
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tasks */}
            {singleJob?.tasks && singleJob.tasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📋</span>
                            Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {singleJob.tasks.map((task, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                        task.completed 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'border-gray-300'
                                    }`}>
                                        {task.completed && (
                                            <svg className="w-2 h-2 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                        {task.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Order Notes */}
            {singleJob?.workOrderNotes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📝</span>
                            Work Order Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-gray-700 leading-relaxed">{singleJob.workOrderNotes}</p>
                            {singleJob.doneTime && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Completed on: {new Date(singleJob.doneTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Order Deliverables */}
            {singleJob?.workOrderImages && singleJob.workOrderImages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <span className="mr-2">📸</span>
                                Work Order Deliverables
                            </span>
                            {isAssignedTechnician && singleJob.status === 'Done' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadLoading}
                                    className="flex items-center space-x-2"
                                >
                                    <Paperclip className="h-4 w-4" />
                                    <span>{uploadLoading ? 'Uploading...' : 'Add More'}</span>
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {singleJob.workOrderImages.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image}
                                        alt={`Deliverable ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(image, '_blank')}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {singleJob.doneTime && (
                            <p className="text-sm text-gray-500 mt-3">
                                Completed on: {new Date(singleJob.doneTime).toLocaleString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add Deliverables Section for In Progress Jobs */}
            {isAssignedTechnician && singleJob.status === 'In Progress' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📸</span>
                            Add Work Progress Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
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
                                    <span>{uploadLoading ? 'Uploading...' : 'Upload Progress Images'}</span>
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                                Upload images to document your work progress. These will be included in the final deliverables.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Notes Section for In Progress Jobs */}
            {isAssignedTechnician && singleJob.status === 'In Progress' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📝</span>
                            Add Work Progress Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Textarea
                                value={notes}
                                onChange={onNotesChange}
                                placeholder="Add notes about your work progress..."
                                className="min-h-[100px]"
                            />
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSaveNotes}
                                >
                                    Save Notes
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                                Add notes about your work progress. These will be included in the final work order notes.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Shipments */}
            {singleJob?.shipments && singleJob.shipments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📦</span>
                            Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {singleJob.shipments.map((shipment, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">Shipment #{shipment.shipmentNumber}</h4>
                                        <Badge variant="outline">{shipment.status}</Badge>
                                    </div>
                                    {shipment.trackingId && (
                                        <p className="text-sm text-gray-600">Tracking: {shipment.trackingId}</p>
                                    )}
                                    {shipment.picture && (
                                        <img src={shipment.picture} alt="Shipment" className="mt-2 w-20 h-20 object-cover rounded" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Custom Fields */}
            {singleJob?.customFields && singleJob.customFields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">⚙️</span>
                            Additional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {singleJob.customFields.map((field, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-1">{field.label}</h4>
                                    <p className="text-gray-700">{field.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default JobDetails;
