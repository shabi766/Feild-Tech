import React from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

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
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{singleJob?.title}</h1>
                    <p className="text-gray-600 mt-2">Job ID: {singleJob?._id?.slice(-8)}</p>
                </div>
                <Badge className={`px-4 py-2 text-sm font-medium ${getStatusColor(singleJob.status)}`}>
                    {singleJob.status}
                </Badge>
            </div>
            
            {/* Status Timeline for Assigned Technician */}
            {isAssignedTechnician && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Job Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${singleJob.checkinTime ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">Check-in</span>
                                    {singleJob.checkinTime && (
                                        <span className="text-xs text-gray-500">
                                            {new Date(singleJob.checkinTime).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${singleJob.checkoutTime ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">Check-out</span>
                                    {singleJob.checkoutTime && (
                                        <span className="text-xs text-gray-500">
                                            {new Date(singleJob.checkoutTime).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${singleJob.status === 'Done' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">Completed</span>
                                    {singleJob.doneTime && (
                                        <span className="text-xs text-gray-500">
                                            {new Date(singleJob.doneTime).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Time Spent</p>
                                <p className="text-lg font-semibold text-indigo-600">
                                    {formatTimeSpent(singleJob.timeSpent)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mb-6">
                {isAssignedTechnician ? (
                    <div className="flex space-x-3">
                        {singleJob.status === 'Assigned' && (
                            <Button 
                                onClick={onCheckin} 
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {actionLoading ? 'Checking In...' : 'Check In'}
                            </Button>
                        )}
                        {singleJob.checkinTime && !singleJob.checkoutTime && (
                            <Button 
                                onClick={onCheckout} 
                                disabled={actionLoading}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                {actionLoading ? 'Checking Out...' : 'Check Out'}
                            </Button>
                        )}
                        {singleJob.checkoutTime && singleJob.status !== 'Done' && (
                            <Button 
                                onClick={onShowCompletionForm} 
                                disabled={actionLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {actionLoading ? 'Marking Done...' : 'Mark Done'}
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {showApplyButton && (
                            <Button
                                onClick={onApply}
                                disabled={actionLoading}
                                className="px-8 py-3 text-lg font-medium bg-indigo-600 hover:bg-indigo-700"
                            >
                                {actionLoading ? 'Applying...' : 'Apply Now'}
                            </Button>
                        )}
                        {showAlreadyApplied && (
                            <Button
                                disabled
                                className="px-8 py-3 text-lg font-medium bg-gray-400 cursor-not-allowed"
                            >
                                Already Applied
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JobHeader;
