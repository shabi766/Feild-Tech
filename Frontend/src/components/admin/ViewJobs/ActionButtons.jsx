// ActionButtons.jsx
import React from 'react';
import { Button } from "@/components/ui/button";

const ActionButtons = ({ job, assignedApplicant, status, setShowLogsDialog }) => {
    if (job && assignedApplicant && ["Assigned", "In Progress", "Done", "Complete", "Paid"].includes(status)) {
        return (
            <div className="flex justify-end gap-2 z-10">
                <Button variant="outline" size="sm" onClick={() => setShowLogsDialog(true)}>
                    Tech Log
                </Button>
            </div>
        );
    }
    return null; // Don't render buttons if conditions are not met
};

export default ActionButtons;