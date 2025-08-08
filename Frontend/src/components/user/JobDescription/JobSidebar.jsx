import React from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

const JobSidebar = ({
    singleJob,
    isAssignedTechnician,
    formatCurrency
}) => {
    return (
        <div className="space-y-6">
            {/* Job Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">💰</span>
                        Compensation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Job Type</h4>
                        <Badge variant="outline" className="capitalize">
                            {singleJob?.jobType}
                        </Badge>
                    </div>

                    {singleJob?.jobType === "part-time" && singleJob?.partTimeOptions && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <strong>Base:</strong> {singleJob.partTimeOptions.base}
                            </p>
                            {singleJob?.salary?.partTime?.hourlyRate && (
                                <p className="text-sm text-gray-600">
                                    <strong>Hourly Rate:</strong> {formatCurrency(singleJob.salary.partTime.hourlyRate)}
                                </p>
                            )}
                            {singleJob?.salary?.partTime?.dailyRate && (
                                <p className="text-sm text-gray-600">
                                    <strong>Daily Rate:</strong> {formatCurrency(singleJob.salary.partTime.dailyRate)}
                                </p>
                            )}
                            {singleJob?.salary?.partTime?.weeklyRate && (
                                <p className="text-sm text-gray-600">
                                    <strong>Weekly Rate:</strong> {formatCurrency(singleJob.salary.partTime.weeklyRate)}
                                </p>
                            )}
                            {singleJob?.salary?.partTime?.contractRate && (
                                <p className="text-sm text-gray-600">
                                    <strong>Contract Rate:</strong> {formatCurrency(singleJob.salary.partTime.contractRate)}
                                </p>
                            )}
                        </div>
                    )}

                    {singleJob?.jobType === "full-time" && singleJob?.fullTimeOptions && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <strong>Base:</strong> {singleJob.fullTimeOptions.base}
                            </p>
                            {singleJob?.salary?.fullTime?.contractRate && (
                                <p className="text-sm text-gray-600">
                                    <strong>Contract Rate:</strong> {formatCurrency(singleJob.salary.fullTime.contractRate)}
                                </p>
                            )}
                            {singleJob?.fullTimeOptions?.contractMonths && (
                                <p className="text-sm text-gray-600">
                                    <strong>Contract Duration:</strong> {singleJob.fullTimeOptions.contractMonths} Months
                                </p>
                            )}
                        </div>
                    )}

                    {singleJob?.totalSalary && (
                        <div className="pt-2 border-t">
                            <p className="text-lg font-semibold text-indigo-600">
                                Total Salary: {formatCurrency(singleJob.totalSalary)}
                            </p>
                        </div>
                    )}

                    {singleJob?.payableSalary && (
                        <div>
                            <p className="text-sm text-gray-600">
                                <strong>Payable Salary:</strong> {formatCurrency(singleJob.payableSalary)}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">📍</span>
                        Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {singleJob?.location?.street && (
                            <p className="text-gray-700">{singleJob.location.street}</p>
                        )}
                        <p className="text-gray-700">
                            {singleJob?.location?.city}, {singleJob?.location?.state} {singleJob?.location?.postalCode}
                        </p>
                        <p className="text-gray-700">{singleJob?.location?.country}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Project Information */}
            {singleJob?.projectName && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">🏗️</span>
                            Project
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">{singleJob.projectName.title}</h4>
                            {singleJob.projectName.description && (
                                <p className="text-sm text-gray-600">{singleJob.projectName.description}</p>
                            )}
                            {singleJob.projectName.website && (
                                <a 
                                    href={singleJob.projectName.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                >
                                    Visit Website
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Client Information */}
            {singleJob?.clientName && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">👤</span>
                            Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">{singleJob.clientName.name}</h4>
                            {singleJob.clientName.email && (
                                <p className="text-sm text-gray-600">{singleJob.clientName.email}</p>
                            )}
                            {singleJob.clientName.phone && (
                                <p className="text-sm text-gray-600">{singleJob.clientName.phone}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contact Information */}
            {(singleJob?.siteContact || singleJob?.SecondaryContact) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📞</span>
                            Site Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {singleJob?.siteContact && (
                            <div>
                                <h4 className="font-medium text-gray-900">Primary Contact</h4>
                                <p className="text-sm text-gray-600">{singleJob.siteContact}</p>
                            </div>
                        )}
                        {singleJob?.SecondaryContact && (
                            <div>
                                <h4 className="font-medium text-gray-900">Secondary Contact</h4>
                                <p className="text-sm text-gray-600">{singleJob.SecondaryContact}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Job Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">📊</span>
                        Job Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Posted:</span>
                        <span className="text-sm text-gray-900">
                            {singleJob?.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Updated:</span>
                        <span className="text-sm text-gray-900">
                            {singleJob?.updatedAt ? new Date(singleJob.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    {singleJob?.totalJobDuration && (
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Duration:</span>
                            <span className="text-sm text-gray-900">
                                {singleJob.totalJobDuration} {singleJob.totalJobTime}
                            </span>
                        </div>
                    )}
                    {singleJob?.payableHours && (
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Payable Hours:</span>
                            <span className="text-sm text-gray-900">{singleJob.payableHours}h</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Completion Requirements */}
            {isAssignedTechnician && singleJob?.completionRequirements && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">✅</span>
                            Completion Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${singleJob.completionRequirements.notesRequired ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-700">Notes Required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${singleJob.completionRequirements.imagesRequired ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-700">Images Required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${singleJob.completionRequirements.deliverablesRequired ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-700">Deliverables Required</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Red dots indicate required fields for job completion
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Attachments */}
            {singleJob?.attachments && singleJob.attachments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📎</span>
                            Attachments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {singleJob.attachments.map((attachment, index) => (
                                <a
                                    key={index}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                >
                                    <span className="mr-2">📄</span>
                                    {attachment.name}
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default JobSidebar;
