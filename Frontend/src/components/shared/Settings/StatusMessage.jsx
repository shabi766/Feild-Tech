import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const StatusMessage = ({ saveStatus }) => {
  if (!saveStatus) return null;

  return (
    <div className={`p-4 rounded-lg flex items-center gap-3 ${
      saveStatus.type === 'success' 
        ? 'bg-green-50 text-green-800 border border-green-200' 
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {saveStatus.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span className="font-medium">{saveStatus.message}</span>
    </div>
  );
};

export default StatusMessage;
