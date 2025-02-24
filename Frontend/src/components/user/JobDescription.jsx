import React, { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/components/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
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
                    setIsApplied(res.data.job.applications?.some(app => app.applicant === user?._id) || false);
                } else {
                    console.error("Error fetching job details:", res.data?.message);
                    toast.error("Error loading job details.");
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
                toast.error("Error loading job details.");
            } finally {
                setLoading(false);
            }
        };

        if (jobId && user?._id) { // Only fetch if jobId and user are available
          fetchSingleJob();
        }

    }, [jobId, dispatch, user?._id]);

    const applyJobHandler = async () => {
        try {
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);

                try {
                    const refetchRes = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                    if (refetchRes.data.success) {
                        dispatch(setSingleJob(refetchRes.data.job));
                        setIsApplied(true);
                    } else {
                        console.error("Error refetching job details:", refetchRes.data?.message);
                        toast.error("Error updating application status. Please refresh the page.");
                    }
                } catch (refetchError) {
                    console.error("Error refetching job details:", refetchError);
                    toast.error("Error updating application status. Please refresh the page.");
                }

                try {
                    const notificationURL = `${NOTIFICATION_API_END_POINT}/send`;
                    const requestBody = {
                        recipientId: singleJob.recruiterId,
                        message: `${user.fullname} has applied for the job: ${singleJob.title}`,
                        type: "job_application",
                        jobId: jobId
                    };

                    const notificationRes = await axios.post(notificationURL, requestBody, { withCredentials: true });

                    if (notificationRes.data.success) {
                        toast.success("Recruiter notified successfully.");
                    } else {
                        console.error("Notification sending failed:", notificationRes.data?.message || "Unknown error");
                        toast.error("Failed to notify recruiter. Please try again later.");
                    }
                } catch (notificationError) {
                    console.error("Error sending notification:", notificationError);
                    toast.error("Failed to notify recruiter. Please try again later.");
                }

            } else {
                console.error("Job application failed:", res.data?.message || "Unknown error");
                toast.error(res.data?.message || "Job application failed.");
            }

        } catch (error) {
            console.error("Error applying for job:", error);
            toast.error(error.response?.data?.message || "Failed to apply for the job.");
        }
    };

    const { street, city, state, postalCode, country } = singleJob?.location || {};

    if (loading) {
        return <p>Loading job details...</p>;
    }

    if (!singleJob) {
        return <p>Job not found.</p>;
    }


    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary} LPA</Badge>
                    </div>
                </div>
                <Button
                    onClick={isApplied ? null : applyJobHandler}
                    disabled={isApplied}
                    className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}
                >
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>

                <h1 className='font-bold my-1'>Location:
                    <span className='pl-4 font-normal text-gray-800'>
                        {street ? `${street}, ` : ''}{city ? `${city}, ` : ''}{state ? `${state}, ` : ''}
                        {postalCode ? `${postalCode}, ` : ''}{country}
                    </span>
                </h1>

                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary} LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length || 0}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt?.split("T")[0]}</span></h1>
            </div>
        </div>
    );
};

export default JobDescription;