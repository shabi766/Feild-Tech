import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Footer from "../shared/Footer";
import ProviderRequests from "./Providercomps/ProviderRequests";
import ProviderTalentpool from "./Providercomps/ProviderTalentpool";
import ProviderTechnicians from "./Providercomps/ProviderTechnicians";
import { JOB_API_END_POINT } from "../utils/constant";

import { ChatContext } from "@/context/ChatContext";
import { MessageCircle } from "lucide-react";
import { parseISO, format } from 'date-fns';

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

   
    const renderStatusBar = () => {
        console.log("Rendering status bar. Job data:", job);

        let checkStatus = null;
        const checkInStr = String(job?.checkInTime);
        const checkOutStr = String(job?.checkOutTime);

        if (checkInStr && checkOutStr) {
            console.log("Both checkInTime and checkOutTime are set.");
            checkStatus = "Checked Out";
        } else if (checkInStr && (!checkOutStr || checkOutStr === 'null' || checkOutStr === 'undefined')) {
            console.log("checkInTime is set, but checkOutTime is null or undefined.");
            checkStatus = "Checked In";
        } else {
            console.log("Neither condition is met.");
        }

        console.log("Check Status:", checkStatus);

        return (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-100 p-4 mb-6 rounded-lg shadow-md">
                <div>
                    <h2 className="text-lg font-semibold">Job ID: {job?._id?.slice(-6) || "---"}</h2>
                    <p>Status: <span className="font-bold">{status}</span></p>
                    {checkStatus && (
                        <div className="mt-2">
                            <p className={`font-semibold ${checkStatus === "Checked Out" ? "bg-green-200 p-1 rounded" : ""}`}>{checkStatus}</p>
                            {checkStatus === "Checked Out" && job?.checkInTime && job?.checkoutTime && (
                                <>
                                    <p className="text-sm">
                                        Check-in: {job?.checkInTime ? format(parseISO(job.checkInTime), 'yyyy-MM-dd HH:mm:ss') : "Invalid Date"}
                                    </p>
                                    <p className="text-sm">
                                        Check-out: {job?.checkoutTime ? format(parseISO(job.checkoutTime), 'yyyy-MM-dd HH:mm:ss') : "Invalid Date"}
                                    </p>
                                </>
                            )}
                            {checkStatus === "Checked In" && job?.checkInTime && (
                                <p className="text-sm">
                                    Check-in: {job?.checkInTime ? format(parseISO(job.checkInTime), 'yyyy-MM-dd HH:mm:ss') : "Invalid Date"}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <div className="md:text-right mt-2 md:mt-0">
                    <h2 className="text-lg font-semibold text-blue-600">Salary: {job?.totalSalary || "---"}</h2>
                    <p className="text-sm text-gray-500">Duration: {job?.totalJobDuration || "---"}</p>
                </div>
                
            </div>
        );
    };
    const renderAssignedProvider = () => {
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
                            </section><section className="my-4">
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
    const renderLogsDialog = () => {
        if (!showLogsDialog) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Tech Logs</h2>
                    {job?.checkInTime ? (
                        <p>Check-in: {format(parseISO(job.checkInTime), 'yyyy-MM-dd HH:mm:ss')}</p>
                    ) : (
                        <p>Check-in: N/A</p>
                    )}
                    {job?.checkoutTime ? (
                        <p>Check-out: {format(parseISO(job.checkoutTime), 'yyyy-MM-dd HH:mm:ss')}</p>
                    ) : (
                        <p>Check-out: N/A</p>
                    )}
                    {job?.checkInTime && job?.checkoutTime ? (
                        <p>Total Time: {calculateTotalTime(job.checkInTime, job.checkoutTime)}</p>
                    ) : (
                        <p>Total Time: N/A</p>
                    )}
                    <button onClick={() => setShowLogsDialog(false)} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded">
                        Close
                    </button>
                </div>
            </div>
        );
    };
    
    const calculateTotalTime = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) {
            return "N/A"; // Or handle this case as you see fit
        }
    
        const checkInDate = parseISO(checkIn);
        const checkOutDate = parseISO(checkOut);
        const difference = checkOutDate.getTime() - checkInDate.getTime();
    
        if (difference < 0) {
            return "Invalid Time Range"; // Or handle this case appropriately
        }
    
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
        return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    };
    

    return (
        <div>
            <div className="bg-gray-50 min-h-screen p-8">
                {renderStatusBar()}
                <div className="flex justify-center space-x-2 -mt-5 z-10" >
                    <button onClick={() => setShowLogsDialog(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs">
                        Tech Log
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs">
                        Dummy
                    </button>
                </div>
<div className="mt-0">
                {renderAssignedProvider()}
                </div>
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
            {renderLogsDialog()}
        </div>
    );
};

export default ViewJob;