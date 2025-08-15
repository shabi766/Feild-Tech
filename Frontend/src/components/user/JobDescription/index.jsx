import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, NOTIFICATION_API_END_POINT } from "../../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob } from "../../../redux/jobSlice";
import { toast } from "sonner";

// Import components
import JobHeader from "./JobHeader";
import CompletionForm from "./CompletionForm";
import JobDetails from "./JobDetails";
import JobSidebar from "./JobSidebar";



const JobDescription = () => {
    const { singleJob } = useSelector((store) => store.job);
    const { user } = useSelector((store) => store.auth);
    const [isApplied, setIsApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [deliverables, setDeliverables] = useState([]);
    const [showCompletionForm, setShowCompletionForm] = useState(false);

    const fileInputRef = useRef(null);
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
                    
                    // Initialize notes and deliverables if they exist
                    if (res.data.job.workOrderNotes) {
                        setNotes(res.data.job.workOrderNotes);
                    }
                    if (res.data.job.workOrderImages && res.data.job.workOrderImages.length > 0) {
                        setDeliverables(res.data.job.workOrderImages);
                    }
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

    // Update isApplied state whenever singleJob changes
    useEffect(() => {
        if (singleJob && user?._id) {
            setIsApplied(singleJob.Application?.some((app) => app.applicant?._id === user?._id) || false);
        }
    }, [singleJob, user?._id]);

    const applyJobHandler = async () => {
        setActionLoading(true);
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
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckin = async () => {
        setActionLoading(true);
        try {
            const res = await axios.put(`${JOB_API_END_POINT}/checkin/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleJob(res.data.job));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckout = async () => {
        setActionLoading(true);
        try {
            const res = await axios.put(`${JOB_API_END_POINT}/checkout/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleJob(res.data.job));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileUpload = async (files) => {
        setUploadLoading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            });

            const res = await axios.post(`${JOB_API_END_POINT}/upload-images/${jobId}`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                toast.success('Images uploaded successfully');
                setDeliverables(prev => [...prev, ...res.data.images]);
                dispatch(setSingleJob(res.data.job));
            } else {
                toast.error('Failed to upload images');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload images');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files);
        }
    };

    const removeDeliverable = (index) => {
        setDeliverables(prev => prev.filter((_, i) => i !== index));
    };

    const handleMarkDone = async () => {
        // Check if completion requirements are met
        const { completionRequirements } = singleJob;
        const errors = [];

        if (completionRequirements?.notesRequired && (!notes || notes.trim().length === 0)) {
            errors.push('Work order notes are required');
        }

        if (completionRequirements?.imagesRequired && deliverables.length === 0) {
            errors.push('At least one image is required');
        }

        if (completionRequirements?.deliverablesRequired && deliverables.length === 0) {
            errors.push('At least one deliverable is required');
        }

        if (errors.length > 0) {
            toast.error(errors.join(', '));
            return;
        }

        setActionLoading(true);
        try {
            const res = await axios.put(`${JOB_API_END_POINT}/done/${jobId}`, {
                notes: notes.trim(),
                deliverables: deliverables,
                images: deliverables
            }, { withCredentials: true });
            
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleJob(res.data.job));
                setShowCompletionForm(false);
                setNotes("");
                setDeliverables([]);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Active': 'bg-green-100 text-green-800',
            'Assigned': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Done': 'bg-purple-100 text-purple-800',
            'Complete': 'bg-emerald-100 text-emerald-800',
            'Review': 'bg-orange-100 text-orange-800',
            'Cancel': 'bg-red-100 text-red-800',
            'Paid': 'bg-indigo-100 text-indigo-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatTimeSpent = (timeSpent) => {
        if (!timeSpent) return 'N/A';
        const hours = Math.floor(timeSpent / (1000 * 60 * 60));
        const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleSaveNotes = () => {
        toast.success('Notes saved locally');
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

    if (!singleJob) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <p className="text-gray-600">Job not found.</p>
                </div>
            </div>
        );
    }

    const isAssignedTechnician = singleJob.assignedApplicant?._id === user?._id;
    const showApplyButton = !isAssignedTechnician && !isApplied;
    const showAlreadyApplied = !isAssignedTechnician && isApplied;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <JobHeader
                    singleJob={singleJob}
                    isAssignedTechnician={isAssignedTechnician}
                    showApplyButton={showApplyButton}
                    showAlreadyApplied={showAlreadyApplied}
                    actionLoading={actionLoading}
                    uploadLoading={uploadLoading}
                    onApply={applyJobHandler}
                    onCheckin={handleCheckin}
                    onCheckout={handleCheckout}
                    onShowCompletionForm={() => setShowCompletionForm(true)}
                    onFileUpload={handleFileInputChange}
                    getStatusColor={getStatusColor}
                    formatTimeSpent={formatTimeSpent}
                />

                {/* Completion Form Modal */}
                <CompletionForm
                    showCompletionForm={showCompletionForm}
                    notes={notes}
                    deliverables={deliverables}
                    actionLoading={actionLoading}
                    uploadLoading={uploadLoading}
                    onClose={() => setShowCompletionForm(false)}
                    onNotesChange={(e) => setNotes(e.target.value)}
                    onFileUpload={handleFileInputChange}
                    onRemoveDeliverable={removeDeliverable}
                    onSubmit={handleMarkDone}
                    singleJob={singleJob}
                    fileInputRef={fileInputRef}
                />



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <JobDetails
                        singleJob={singleJob}
                        isAssignedTechnician={isAssignedTechnician}
                        notes={notes}
                        deliverables={deliverables}
                        uploadLoading={uploadLoading}
                        onNotesChange={(value) => setNotes(value)}
                        onFileUpload={handleFileInputChange}
                        onSaveNotes={handleSaveNotes}
                        fileInputRef={fileInputRef}
                    />

                    {/* Sidebar */}
                    <JobSidebar
                        singleJob={singleJob}
                        isAssignedTechnician={isAssignedTechnician}
                        formatCurrency={formatCurrency}
                    />
                </div>
            </div>
        </div>
    );
};

export default JobDescription;
