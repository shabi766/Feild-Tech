// AssignedProvider.jsx
import React from 'react';
import { MessageCircle } from 'lucide-react';

const AssignedProvider = ({ assignedApplicant, handleStartChat, navigate }) => {
    if (!assignedApplicant) return null;

    return (
        <div className="p-4 bg-green-100 border border-green-400 rounded-lg mb-6 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate(`/technicians/${assignedApplicant._id}`)}>
                    <img
                        src={assignedApplicant.profilePhoto || "/default-profile.png"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                    />
                    <div>
                        <p className="text-xs text-gray-500">ID: {assignedApplicant._id?.slice(0, 6) || "---"}</p>
                        <h3 className="text-lg font-semibold text-gray-900">{assignedApplicant.fullname || "---"}</h3>
                        <p className="text-sm text-gray-600">📞 {assignedApplicant.phoneNumber || "---"}</p>
                        <p className="text-sm text-gray-600">✉️ {assignedApplicant.email || "---"}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center ml-auto">
                    <h3 className="text-lg font-bold text-green-700 mb-1">Assigned</h3>
                    <button
                        onClick={() => handleStartChat(assignedApplicant)}
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                    >
                        <MessageCircle className="w-6 h-6 text-indigo-500 hover:text-indigo-700 transition" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignedProvider;