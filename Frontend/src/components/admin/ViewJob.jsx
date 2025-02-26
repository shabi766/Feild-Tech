import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Footer from "../shared/Footer";
import ProviderRequests from "./Providercomps/ProviderRequests";
import ProviderTalentpool from "./Providercomps/ProviderTalentpool";
import ProviderTechnicians from "./Providercomps/ProviderTechnicians";
import { CLIENT_API_END_POINT, JOB_API_END_POINT, PROJECT_API_END_POINT } from "../utils/constant";

import { ChatContext } from "@/context/ChatContext";
import { MessageCircle } from "lucide-react";

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
    const [assignedApplicant, setAssignedApplicant] = useState(null); // Track assigned provider

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

                    // Find assigned provider
                    if (jobData.assignedApplicant) {
                        console.log("Assigned Applicant:", jobData.assignedApplicant);
                        setAssignedApplicant(jobData.assignedApplicant);
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
    const renderStatusBar = () => (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-100 p-4 mb-6 rounded-lg shadow-md">
            <div>
                <h2 className="text-lg font-semibold">Job ID: {job?._id?.slice(-4) || "---"}</h2>
                <p>Status: <span className="font-bold">{status}</span></p>
            </div>
            <div className="md:text-right mt-2 md:mt-0">
                <h2 className="text-lg font-semibold text-blue-600">Salary: {job?.totalSalary || "---"}</h2>
                <p className="text-sm text-gray-500">Duration: {job?.totalJobDuration || "---"}</p>
            </div>
        </div>
    );

    // Render assigned provider section only if assigned
    const renderAssignedProvider = () => {
        if (!assignedApplicant) return null;

        return (
            <div className="p-4 bg-green-100 border border-green-400 rounded-lg mb-6 shadow-md">
                <div className="flex items-center justify-between">
                    {/* ✅ Left Side - Profile & Info */}
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

                    {/* ✅ Right Side - "Assigned" Above Chat Icon */}
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
    const renderContent = () => {
        if (mainTab === "Job Details") {
            return (
                <div className="bg-white p-8 shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl">
                    {job ? (
                        <>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Title</h3>
                                <p className="text-gray-700">{job?.title || "---"}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Job Description</h3>
                                <p className="text-gray-700">{job?.description || "---"}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Client</h3>
                                <p className="text-gray-700">{clientName}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Project</h3>
                                <p className="text-gray-700">{projectName}</p>
                            </section>

                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Job Type</h3>
                                <p className="text-gray-700">{jobType}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">ETA Start Time</h3>
                                <p className="text-gray-700">{job?.startTime || '---'}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">ETA End Time</h3>
                                <p className="text-gray-700">{job?.endTime || '---'}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Address</h3>
                                <p className="text-gray-700">{job?.location?.street || '---'}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Skills</h3>
                                <p className="text-gray-700">{job?.skills?.join(', ') || '---'}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Required Tools</h3>
                                <p className="text-gray-700">{job?.requiredTools?.join(', ') || '---'}</p>
                            </section>
                        </>
                    ) : (
                        <p className="text-center text-gray-600">No job details available.</p>
                    )}
                </div>
            );
        } else if (mainTab === "Provider") {
            return (
                <div>
                    <div className="border-b border-gray-300 mb-4 flex justify-around">
                        <button onClick={() => setProviderTab("Requests")} className={`py-2 px-4 ${providerTab === "Requests" && "border-b-2 border-blue-600 text-blue-600"}`}>
                            Requests
                        </button>
                        <button onClick={() => setProviderTab("Talentpool")} className={`py-2 px-4 ${providerTab === "Talentpool" && "border-b-2 border-blue-600 text-blue-600"}`}>
                            Talentpool
                        </button>
                        <button onClick={() => setProviderTab("Technicians")} className={`py-2 px-4 ${providerTab === "Technicians" && "border-b-2 border-blue-600 text-blue-600"}`}>
                            Technicians
                        </button>
                    </div>
                    {providerTab === "Requests" && <ProviderRequests />}
                    {providerTab === "Talentpool" && <ProviderTalentpool />}
                    {providerTab === "Technicians" && <ProviderTechnicians />}
                </div>
            );
        }
    };

    if (loading) return <p>Loading job details...</p>;

    return (
        <div>
            
            <div className="bg-gray-50 min-h-screen p-8">
                {renderStatusBar()}
                {renderAssignedProvider()} {/* Assigned Provider Bar */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                    <div className="border-b border-gray-300 flex justify-around mb-4">
                        <button onClick={() => setMainTab("Job Details")} className={`flex-1 py-2 px-4 ${mainTab === "Job Details" && "border-b-2 border-blue-600 text-blue-600"}`}>
                            Job Details
                        </button>
                        <button onClick={() => setMainTab("Provider")} className={`flex-1 py-2 px-4 ${mainTab === "Provider" && "border-b-2 border-blue-600 text-blue-600"}`}>
                            Provider
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ViewJob;
