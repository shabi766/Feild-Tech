import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { JOB_API_END_POINT } from "@/components/utils/constant";
import { ChatContext } from "@/context/ChatContext";

import JobStatusBar from "./JobStatusBar";
import AssignedProvider from "./AssignedProvider";
import JobDetails from "./JobDetails";
import ProviderTabs from "./ProviderTabs";
import LogsDialog from "./LogsDialog";
import ActionButtons from "./ActionButtons";

const ViewJob = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const navigate = useNavigate();
    const { startChatWithUser, setSelectedChat } = useContext(ChatContext);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Draft");
    const [jobType, setJobType] = useState("part-time");
    const [clientName, setClientName] = useState("");
    const [projectName, setProjectName] = useState("");
    const [mainTab, setMainTab] = useState("Job Details");
    const [providerTab, setProviderTab] = useState("Requests");
    const [assignedApplicant, setAssignedApplicant] = useState(null);
    const [showLogsDialog, setShowLogsDialog] = useState(false);
    const [payableHours, setPayableHours] = useState(0);
    const [payableSalary, setPayableSalary] = useState(0);

    useEffect(() => {
        const fetchJobDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${JOB_API_END_POINT}/get/${id}`, { withCredentials: true });

                if (response.data.success && response.data.job) {
                    const jobData = response.data.job;
                    setJob(jobData);
                    setStatus(jobData.status || "Draft");
                    setJobType(jobData.jobType || "part-time");
                    setClientName(jobData.clientName?.name || "---");
                    setProjectName(jobData.projectName?.name || "---");

                    if (jobData.assignedApplicant) {
                        setAssignedApplicant(jobData.assignedApplicant);
                    }

                    if (jobData.status === "Done" && jobData.jobType === "part-time" && jobData.partTimeOptions?.base === "hourly") {
                        try {
                            const payableRes = await axios.get(`${JOB_API_END_POINT}/calculate-payble/${id}`, { withCredentials: true });
                            if (payableRes.data.success) {
                                setPayableHours(payableRes.data.payableHours);
                                setPayableSalary(payableRes.data.payableSalary);
                            } else {
                                console.error("Calculate payable failed:", payableRes.data?.message || "Unknown error");
                            }
                        } catch (payableError) {
                            console.error("Error calculating payable:", payableError);
                        }
                    }

                } else {
                    console.error("Job data not found or unsuccessful response:", response.data?.message || "Unknown error");
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [id]);

    const handleStartChat = async (applicant) => {
        try {
            const chat = await startChatWithUser(applicant._id);
            setSelectedChat(chat);
            navigate(`/chat?chatId=${chat._id}`);
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Invalid Date";
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid Date";
        }
    };

    const calculateTotalTime = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) {
            return "N/A";
        }

        try {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return "Invalid Date";
            }

            const difference = checkOutDate.getTime() - checkInDate.getTime();

            if (difference < 0) {
                return "Invalid Time Range";
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        } catch (error) {
            console.error("Error calculating total time:", error);
            return "Invalid Date";
        }
    };

    const handlePay = async () => {
        try {
            await axios.put(`${JOB_API_END_POINT}/update/${id}`, { status: "Complete" }, { withCredentials: true });
            setStatus("Complete");
            alert("Payment processed and job marked as completed.");
        } catch (error) {
            console.error("Error updating job status:", error);
            alert("Failed to update job status.");
        }
    };

    if (loading) return <p>Loading job details...</p>;

    return (
        <div>
            <div className="bg-gray-50 min-h-screen p-8">
                <JobStatusBar job={job} status={status} handlePay={handlePay} formatDate={formatDate} />
                <ActionButtons job={job} assignedApplicant={assignedApplicant} status={status} setShowLogsDialog={setShowLogsDialog} />
                <div className="mt-0">
                    <AssignedProvider assignedApplicant={assignedApplicant} handleStartChat={handleStartChat} navigate={navigate} />
                </div>
                <div className="bg-white p-8 shadow-lg rounded-lg">
                    <div className="border-b border-gray-300 flex justify-around mb-4">
                        <button onClick={() => setMainTab("Job Details")} className={`flex-1 py-2 px-4 ${mainTab === "Job Details" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}> Job Details </button>
                        <button onClick={() => setMainTab("Provider")} className={`flex-1 py-2 px-4 ${mainTab === "Provider" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}>
                            Provider
                        </button>
                    </div>
                    {mainTab === "Job Details" && <JobDetails job={job} clientName={clientName} projectName={projectName} jobType={jobType} formatDate={formatDate} />}
                    {mainTab === "Provider" && <ProviderTabs providerTab={providerTab} setProviderTab={setProviderTab} />}
                </div>
                <LogsDialog job={job} showLogsDialog={showLogsDialog} setShowLogsDialog={setShowLogsDialog} formatDate={formatDate} calculateTotalTime={calculateTotalTime} />
            </div>
        </div>
    );
};

export default ViewJob;