import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { JOB_API_END_POINT, WALLET_API_END_POINT } from "@/components/utils/constant";
import { loadStripe } from "@stripe/stripe-js";
import { ChatContext } from "@/context/ChatContext";

import JobStatusBar from "./JobStatusBar";
import AssignedProvider from "./AssignedProvider";
import JobDetails from "./JobDetails";
import ProviderTabs from "./ProviderTabs";
import JobActivity from "./JobActivity";
import JobSidebar from "@/components/user/JobDescription/JobSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            // Create Stripe Checkout session
            const resp = await axios.post(`${WALLET_API_END_POINT}/checkout/${id}`, {}, { withCredentials: true });
            if (resp.data?.url) {
                window.location.href = resp.data.url;
                return;
            }
            // Fallback to Payment Intent flow if no URL
            const piResp = await axios.post(`${WALLET_API_END_POINT}/pay/${id}`, {}, { withCredentials: true });
            const clientSecret = piResp.data?.clientSecret;
            if (!clientSecret) throw new Error("No client secret from server");
            const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            if (!stripe) throw new Error("Stripe failed to load");
            // Use Payment Element elsewhere; for now just inform
            alert("Payment initialized. Implement card element to confirm payment.");
        } catch (error) {
            console.error("Error starting payment:", error);
            alert(error?.response?.data?.message || error.message || "Payment failed to start");
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "N/A";
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        } catch {
            return `${amount}`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <JobStatusBar job={job} status={status} handlePay={handlePay} formatDate={formatDate} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Provider Section - directly under status bar */}
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Providers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProviderTabs providerTab={providerTab} setProviderTab={setProviderTab} />
                            </CardContent>
                        </Card>

                        {/* Assigned Provider - prominent */}
                        <AssignedProvider assignedApplicant={assignedApplicant} handleStartChat={handleStartChat} navigate={navigate} />

                        {/* Activity / Logs */}
                        <JobActivity job={job} formatDate={formatDate} calculateTotalTime={calculateTotalTime} />

                        {/* Job Details */}
                        <JobDetails
                            job={job}
                            clientName={clientName}
                            projectName={projectName}
                            jobType={jobType}
                            formatDate={formatDate}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <JobSidebar singleJob={job} isAssignedTechnician={false} formatCurrency={formatCurrency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewJob;