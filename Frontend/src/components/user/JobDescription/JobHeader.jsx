import React from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useTranslation } from '@/Hooks/useTranslation';

const JobHeader = ({
    singleJob,
    isAssignedTechnician,
    showApplyButton,
    showAlreadyApplied,
    actionLoading,
    uploadLoading,
    onApply,
    onCheckin,
    onCheckout,
    onShowCompletionForm,
    onFileUpload,
    getStatusColor,
    formatTimeSpent
}) => {
    const { t } = useTranslation();

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{singleJob?.title}</h1>
                    <p className="text-gray-600 mt-2">{t('jobId')}: {singleJob?._id?.slice(-8)}</p>
                </div>
                <Badge className={`px-4 py-2 text-sm font-medium ${getStatusColor(singleJob.status)}`}>
                    {singleJob.status}
                </Badge>
            </div>

            {/* Status Timeline for Assigned Technician */}
            {isAssignedTechnician && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('jobProgress')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">{t('applied')}</span>
                                </div>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${singleJob.status === 'Assigned' || singleJob.status === 'In Progress' || singleJob.status === 'Done' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm text-gray-600">{t('assigned')}</span>
                                </div>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${singleJob.status === 'In Progress' || singleJob.status === 'Done' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm text-gray-600">{t('inProgress')}</span>
                                </div>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${singleJob.status === 'Done' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm text-gray-600">{t('completed')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
                {showApplyButton && (
                    <Button
                        onClick={onApply}
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        {actionLoading ? t('applying') : t('applyNow')}
                    </Button>
                )}

                {showAlreadyApplied && (
                    <Button
                        disabled
                        variant="outline"
                        className="px-6 py-2 rounded-lg"
                    >
                        {t('alreadyApplied')}
                    </Button>
                )}

                {isAssignedTechnician && singleJob.status === 'Assigned' && (
                    <Button
                        onClick={onCheckin}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                    >
                        {actionLoading ? t('checkingIn') : t('checkIn')}
                    </Button>
                )}

                {isAssignedTechnician && singleJob.status === 'In Progress' && (
                    <div className="flex gap-4">
                        <Button
                            onClick={onCheckout}
                            disabled={actionLoading}
                            variant="outline"
                            className="px-6 py-2 rounded-lg"
                        >
                            {actionLoading ? t('checkingOut') : t('checkOut')}
                        </Button>
                        <Button
                            onClick={onShowCompletionForm}
                            disabled={actionLoading}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
                        >
                            {t('markAsDone')}
                        </Button>
                    </div>
                )}

                {isAssignedTechnician && singleJob.status === 'Done' && (
                    <Button
                        onClick={onShowCompletionForm}
                        disabled={actionLoading}
                        variant="outline"
                        className="px-6 py-2 rounded-lg"
                    >
                        {t('viewCompletionDetails')}
                    </Button>
                )}
            </div>

            {/* Job Summary */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('budget')}</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {singleJob?.budget ? `$${singleJob.budget}` : t('notSpecified')}
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('duration')}</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {singleJob?.duration ? singleJob.duration : t('notSpecified')}
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('timeSpent')}</h3>
                            <p className="text-2xl font-bold text-primary">
                                {singleJob?.timeSpent ? formatTimeSpent(singleJob.timeSpent) : '0h 0m'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default JobHeader;
