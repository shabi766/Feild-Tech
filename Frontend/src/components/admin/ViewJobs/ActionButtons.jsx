// ActionButtons.jsx
import React from 'react';

const ActionButtons = ({ job, assignedApplicant, status, setShowLogsDialog }) => {
    if (job && assignedApplicant && ["Assigned", "In Progress", "Done", "Complete", "Paid"].includes(status)) {
        return (
            <div className="flex justify-center space-x-2 -mt-5 z-10">
                <button
                    onClick={() => setShowLogsDialog(true)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
                >
                    Tech Log
                </button>

                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs">
                    Dummy
                </button>
            </div>
        );
    }
    return null; // Don't render buttons if conditions are not met
};

export default ActionButtons;