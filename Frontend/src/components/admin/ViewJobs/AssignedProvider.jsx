// AssignedProvider.jsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssignedProvider = ({ assignedApplicant, handleStartChat, navigate }) => {
    if (!assignedApplicant) return null;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Assigned Technician</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <div className="flex items-center gap-2">
                        <span className="text-green-700 font-semibold">Assigned</span>
                        <button
                            onClick={() => handleStartChat(assignedApplicant)}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                            title="Start Chat"
                        >
                            <MessageCircle className="w-5 h-5 text-indigo-600" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AssignedProvider;