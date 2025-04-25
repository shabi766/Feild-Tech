// LogsDialog.jsx
import React from 'react';

const LogsDialog = ({ job, showLogsDialog, setShowLogsDialog, formatDate, calculateTotalTime }) => {
    if (!showLogsDialog) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Tech Logs</h2>
                {job?.checkinTime ? (
                    <p>Check-in: {formatDate(job.checkinTime)}</p>
                ) : (
                    <p>Check-in: N/A</p>
                )}
                {job?.checkoutTime ? (
                    <p>Check-out: {formatDate(job.checkoutTime)}</p>
                ) : (
                    <p>Check-out: N/A</p>
                )}
                {job?.checkinTime && job?.checkoutTime ? (
                    <p>Total Time: {calculateTotalTime(job.checkinTime, job.checkoutTime)}</p>
                ) : (
                    <p>Total Time: N/A</p>
                )}
                <button onClick={() => setShowLogsDialog(false)} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold pyx-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
};

export default LogsDialog;