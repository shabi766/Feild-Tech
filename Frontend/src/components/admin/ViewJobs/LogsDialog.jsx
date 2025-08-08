// LogsDialog.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LogsDialog = ({ job, showLogsDialog, setShowLogsDialog, formatDate, calculateTotalTime }) => {
    if (!showLogsDialog) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tech Logs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        <span className="font-medium">Check-in:</span> {job?.checkinTime ? formatDate(job.checkinTime) : 'N/A'}
                    </p>
                    <p>
                        <span className="font-medium">Check-out:</span> {job?.checkoutTime ? formatDate(job.checkoutTime) : 'N/A'}
                    </p>
                    <p>
                        <span className="font-medium">Total Time:</span> {job?.checkinTime && job?.checkoutTime ? calculateTotalTime(job.checkinTime, job.checkoutTime) : 'N/A'}
                    </p>
                </div>
                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={() => setShowLogsDialog(false)}>Hide</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LogsDialog;