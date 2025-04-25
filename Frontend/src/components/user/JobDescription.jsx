import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, NOTIFICATION_API_END_POINT } from "@/components/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob } from "@/redux/jobSlice";
import { toast } from "sonner";
import { Button } from "../ui/button";

const JobDescription = () => {
    const { singleJob } = useSelector((store) => store.job);
    const { user } = useSelector((store) => store.auth);
    const [isApplied, setIsApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSingleJob = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.Application?.some((app) => app.applicant?._id === user?._id) || false);
                } else {
                    toast.error("Error loading job details.");
                }
            } catch (error) {
                toast.error("Error loading job details.");
            } finally {
                setLoading(false);
            }
        };

        if (jobId && user?._id) {
            fetchSingleJob();
        }
    }, [jobId, dispatch, user?._id]);

    const applyJobHandler = async () => {
        try {
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                setIsApplied(true);

                try {
                    await axios.post(`${NOTIFICATION_API_END_POINT}/send`, {
                        recipientId: singleJob.created_by,
                        message: `${user.fullname} has applied for the job: ${singleJob.title}`,
                        type: "job_application",
                        jobId: jobId
                    }, { withCredentials: true });
                } catch {
                    toast.error("Failed to notify recruiter.");
                }
            } else {
                toast.error("Job application failed.");
            }
        } catch (error) {
            toast.error("Failed to apply for the job.");
        }
    };

    const handleCheckin = async () => {
        try {
            const res = await axios.put(`${JOB_API_END_POINT}/checkin/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleJob(res.data.job)); // Update job data
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const handleCheckout = async () => {
        try {
            const res = await axios.put(`${JOB_API_END_POINT}/checkout/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleJob(res.data.job)); // Update job data
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const handleMarkDone = async () => {
        try {
            const res = await axios.put(`${JOB_API_END_POINT}/done/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleJob(res.data.job)); // Update job data
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading job details...</p></div>;
    }

    if (!singleJob) {
        return <div className="flex justify-center items-center h-screen"><p>Job not found.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-300">
                {/* Status Bar */}
                <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex justify-between items-center">
                    {singleJob.assignedApplicant?._id === user?._id ? (
                        <div>
                            <p>Status: {singleJob.status}</p>
                            {singleJob.status === 'Assigned' && <Button onClick={handleCheckin}>Check In</Button>}
                            {singleJob.checkinTime && !singleJob.checkoutTime && <Button onClick={handleCheckout}>Check Out</Button>}
                            {singleJob.checkoutTime && singleJob.status !== 'Done' && <Button onClick={handleMarkDone}>Mark Done</Button>}
                            {singleJob.checkinTime && <p>Checked in at: {new Date(singleJob.checkinTime).toLocaleString()}</p>}
                            {singleJob.timeSpent && <p>Time spent: {singleJob.timeSpent} ms</p>}
                        </div>
                    ) : (
                        <Button
                            onClick={isApplied ? null : applyJobHandler}
                            disabled={isApplied}
                            className={`px-6 py-2 text-white rounded-lg ${isApplied ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            {isApplied ? "Already Applied" : "Apply Now"}
                        </Button>
                    )}
                </div>
                {/* 🔹 Job Title (Top Priority Section) */}
            <div className="mb-6 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-900">{singleJob?.title}</h1>
                    <p className="text-sm text-gray-600 mt-1">📌 ID: {singleJob?._id?.slice(-6)}</p>
                    <p className="text-sm text-gray-600">📅 Posted: {singleJob?.createdAt?.split("T")[0]}</p>
                    <p className="text-sm text-gray-600">🔄 Updated: {singleJob?.updatedAt?.split("T")[0]}</p>
                </div>
                {/* 🔹 Salary & Apply Button (Top Priority Section) */}
                <div className="mb-6 p-6 bg-indigo-50 border border-indigo-300 rounded-lg flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-indigo-700">💰 Salary & Job Type</h2>
                    <p className="text-gray-700 mt-2"><strong>Job Type:</strong> {singleJob?.jobType}</p>
                    {singleJob?.jobType === "part-time" && singleJob?.partTimeOptions && (
                        <>
                            <p className="text-gray-700"><strong>Base:</strong> {singleJob?.partTimeOptions?.base}</p>
                            {singleJob?.salary?.partTime?.hourlyRate && <p className="text-gray-700"><strong>Hourly Rate:</strong> ${singleJob?.salary?.partTime?.hourlyRate}</p>}
                            {singleJob?.salary?.partTime?.dailyRate && <p className="text-gray-700"><strong>Daily Rate:</strong> ${singleJob?.salary?.partTime?.dailyRate}</p>}
                            {singleJob?.salary?.partTime?.weeklyRate && <p className="text-gray-700"><strong>Weekly Rate:</strong> ${singleJob?.salary?.partTime?.weeklyRate}</p>}
                            {singleJob?.salary?.partTime?.monthlyRate && <p className="text-gray-700"><strong>Monthly Rate:</strong> ${singleJob?.salary?.partTime?.monthlyRate}</p>}
                        </>
                    )}
                    {singleJob?.jobType === "full-time" && singleJob?.fullTimeOptions && (
                        <>
                            {singleJob?.salary?.fullTime?.contractRate && <p className="text-gray-700"><strong>Contract Rate:</strong> ${singleJob?.salary?.fullTime?.contractRate}</p>}
                            <p className="text-gray-700"><strong>Contract Duration:</strong> {singleJob?.fullTimeOptions?.contractMonths} Months</p>
                        </>
                    )}
                </div>               
                </div>
                {/* 🔹 Job Description */}
                <div className="mb-6 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">📄 Job Description</h2>
                    <p className="text-gray-700">{singleJob?.description}</p>
                    <div className="mt-4 space-y-2">
                        {singleJob?.skills && (
                            <p className="text-gray-700"><strong>🛠 Skills Required:</strong> {singleJob?.skills.join(", ")}</p>
                        )}
                        {singleJob?.requiredTools && (
                            <p className="text-gray-700"><strong>🧰 Tools Needed:</strong> {singleJob?.requiredTools.join(", ")}</p>
                        )}
                        <p className="text-gray-700"><strong>📊 Experience:</strong> {singleJob?.experience} yrs</p>
                        {singleJob?.projectName && (
                            <p className="text-gray-700"><strong>🏗 Project:</strong> {singleJob?.projectName?.title}</p>
                        )}
                    </div>
                </div>

                {/* 🔹 Address Section */}
                <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">📍 Location</h2>
                    <p className="text-gray-700">
                        {singleJob?.location?.street}, {singleJob?.location?.city}, {singleJob?.location?.state}, {singleJob?.location?.country}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JobDescription;