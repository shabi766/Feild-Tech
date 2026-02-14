import React from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useTranslation } from '@/Hooks/useTranslation';
import { formatLocation } from '@/utils/locationUtils';

const JobSidebar = ({
    singleJob,
    isAssignedTechnician,
    formatCurrency
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {/* Job Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">💰</span>
                        {t('compensation')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('jobType')}</h4>
                        <Badge variant="outline" className="capitalize">
                            {singleJob?.jobType}
                        </Badge>
                    </div>

                    {singleJob?.salary && (
                        <div className="space-y-2">
                            {singleJob.salary.hourly && (
                                <p className="text-sm text-gray-600">
                                    <strong>{t('salary')}:</strong> {formatCurrency(singleJob.salary.hourly)}/hr
                                </p>
                            )}
                            {singleJob.salary.fixed && (
                                <p className="text-sm text-gray-600">
                                    <strong>{t('salary')}:</strong> {formatCurrency(singleJob.salary.fixed)}
                                </p>
                            )}
                            {singleJob.salary.range && (
                                <p className="text-sm text-gray-600">
                                    <strong>{t('salary')}:</strong> {formatCurrency(singleJob.salary.range.min)} - {formatCurrency(singleJob.salary.range.max)}
                                </p>
                            )}
                        </div>
                    )}

                    {singleJob?.jobType === "full-time" && singleJob?.fullTimeOptions && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <strong>{t('base')}:</strong> {singleJob.fullTimeOptions.base}
                            </p>
                            {singleJob?.salary?.fullTime?.contractRate && (
                                <p className="text-sm text-gray-600">
                                    <strong>{t('contractRate')}:</strong> {formatCurrency(singleJob.salary.fullTime.contractRate)}
                                </p>
                            )}
                            {singleJob?.fullTimeOptions?.contractMonths && (
                                <p className="text-sm text-gray-600">
                                    <strong>{t('contractDuration')}:</strong> {singleJob.fullTimeOptions.contractMonths} {t('months')}
                                </p>
                            )}
                        </div>
                    )}

                    {singleJob?.totalSalary && (
                        <div className="pt-2 border-t">
                            <p className="text-lg font-semibold text-primary">
                                {t('totalSalary')}: {formatCurrency(singleJob.totalSalary)}
                            </p>
                        </div>
                    )}

                    {singleJob?.payableSalary && (
                        <div>
                            <p className="text-sm text-gray-600">
                                <strong>{t('payableSalary')}:</strong> {formatCurrency(singleJob.payableSalary)}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Work Type */}
            {singleJob?.workType && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">🏢</span>
                            {t('workType')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="capitalize">
                            {singleJob.workType}
                        </Badge>
                    </CardContent>
                </Card>
            )}

            {/* Location */}
            {singleJob?.location && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📍</span>
                            {t('location')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-700">
                            {formatLocation(singleJob.location)}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Project Information */}
            {singleJob?.projectName && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">🏗️</span>
                            {t('project')}
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
                                    className="text-primary hover:text-primary-dark text-sm"
                                >
                                    {t('visitWebsite')}
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Client Information */}
            {singleJob?.client && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">👤</span>
                            Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">{singleJob.client.name}</h4>
                            {singleJob.client.company && (
                                <p className="text-sm text-gray-600">{singleJob.client.company}</p>
                            )}
                            {singleJob.client.rating && (
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-600">Rating:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-4 h-4 ${i < singleJob.client.rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                    }`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Job Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">📊</span>
                        {t('jobDetails')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{t('posted')}:</span>
                        <span className="text-sm text-gray-900">
                            {singleJob?.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{t('updated')}:</span>
                        <span className="text-sm text-gray-900">
                            {singleJob?.updatedAt ? new Date(singleJob.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    {singleJob?.totalJobDuration && (
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{t('duration')}:</span>
                            <span className="text-sm text-gray-900">
                                {singleJob.totalJobDuration} {singleJob.totalJobTime}
                            </span>
                        </div>
                    )}
                    {singleJob?.payableHours && (
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{t('payableHours')}:</span>
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
                                    className="flex items-center p-2 text-sm text-primary hover:text-primary-dark hover:bg-secondary rounded"
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
