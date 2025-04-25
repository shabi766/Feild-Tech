import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { APPLICATION_API_END_POINT, NOTIFICATION_API_END_POINT} from "@/components/utils/constant";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { ChatContext } from "@/context/ChatContext";

const ProviderRequests = ({ onJobAssigned }) => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedApplicant, setAssignedApplicant] = useState(null);
  const { startChatWithUser, setSelectedChat } = useContext(ChatContext);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
          { withCredentials: true }
        );
        console.log("API response:", response.data);

        if (response.data.success && response.data.job?.Application) {
          const applications = response.data.job.Application;
          setApplicants(applications);

          // Check if any applicant is already assigned
          const assignedApp = applications.find(
            (app) => app.status === "assigned"
          );
          setAssignedApplicant(assignedApp || null);
        } else {
          setError("Failed to load applicants");
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setError("Error fetching applicants");
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId]);
  const handleStartChat = async (applicant) => {
    try {
        const chat = await startChatWithUser(applicant._id);
        setSelectedChat(chat); // ✅ Set the selected chat
        
        // ✅ Redirect with chatId as a query parameter
        navigate(`/chat?chatId=${chat._id}`); 
    } catch (error) {
        console.error("Error starting chat:", error);
    }
};

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const response = await axios.patch(
        `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (newStatus === "assigned") {
          try {
            await axios.post(
              `${NOTIFICATION_API_END_POINT}/job-assigned`,
              { jobId },
              { withCredentials: true }
            );
            toast.success("Applicant assigned and notification sent.");

            // Update assigned applicant
            const assignedApp = applicants.find((app) => app._id === applicationId);
            setAssignedApplicant(assignedApp || null);
          } catch (notificationError) {
            console.error("Notification error:", notificationError);
            toast.error("Error sending notification.");
          }
        }

        // Update applicant list
        setApplicants((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );

        toast.success("Status updated successfully.");
      } else {
        toast.error(`Failed to update status: ${response.data?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  if (loading) return <p>Loading applicants...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="bg-white p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Applicants</h2>
      {applicants.length === 0 ? (
        <p>No applicants for this job.</p>
      ) : assignedApplicant ? (
        <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
  <div className="flex items-center justify-between">
    {/* ✅ Profile Section */}
    <div className="flex items-center space-x-4">
      <img
        src={assignedApplicant.applicant?.profilePhoto || "/default-profile.png"}
        alt="Profile"
        className="w-12 h-12 rounded-full border border-gray-300 object-cover cursor-pointer"
        onClick={() => navigate(`/technicians/${assignedApplicant.applicant?._id}`)}
      />
      <div>
        <p className="text-xs text-gray-500">
          ID: {assignedApplicant.applicant?._id?.slice(0, 6) || "---"}
        </p>
        <h3 className="text-lg font-semibold text-gray-900">
          {assignedApplicant.applicant?.fullname || "---"}
        </h3>
        <p className="text-sm text-gray-600">
          📞 {assignedApplicant.applicant?.phoneNumber || "---"}
        </p>
        <p className="text-sm text-gray-600">
          ✉️ {assignedApplicant.applicant?.email || "---"}
        </p>
      </div>
    </div>

    {/* ✅ "Assigned" Status & Chat Icon in the Middle-Right */}
    <div className="flex flex-col items-center ml-auto">
      <h3 className="text-lg font-bold text-green-700 mb-1">Assigned</h3> {/* ✅ Centered Above Icon */}
      <button 
        onClick={() => handleStartChat(assignedApplicant.applicant)} 
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <MessageCircle className="w-6 h-6 text-indigo-500 hover:text-indigo-700 transition" />
      </button>
    </div>
  </div>
</div>

      ) : (
        <ul className="space-y-4">
          {applicants.map((applicant) => (
            <li key={applicant._id} className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={applicant.applicant?.profilePhoto || "/default-profile.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border border-gray-300 object-cover cursor-pointer"
                  onClick={() => navigate(`/technicians/${applicant.applicant?._id}`)}
                />
                <div>
                  <p className="text-xs text-gray-500">
                    ID: {applicant.applicant?._id?.slice(0, 6) || "---"}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 cursor-pointer hover:underline"
                   onClick={() => navigate(`/technicians/${applicant.applicant?._id}`)} 
                  >
                    {applicant.applicant?.fullname || "---"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    📞 {applicant.applicant?.phoneNumber || "---"}
                  </p>
                  <p className="text-sm text-gray-600">
                    ✉️ {applicant.applicant?.email || "---"}
                  </p>
                  <p className="text-sm text-gray-600">Status: {applicant.status}</p>
                </div>
              </div>
              {/* Show buttons only if no one is assigned */}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => updateStatus(applicant._id, "assigned")}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Assign
                </button>
                <button
                  onClick={() => updateStatus(applicant._id, "rejected")}
                  className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Reject
                </button>
                
                <button onClick={() => handleStartChat(applicant.applicant)}  className="p-2 rounded-full hover:bg-gray-200 transition ml-auto">
                  <MessageCircle className="w-6 h-6 text-indigo-500 hover:text-indigo-700 transition" />
                </button>
                
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProviderRequests;
