import React, { useState, useEffect } from 'react';
import JobFormStepper from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { JOB_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/components/utils/constant';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchProjectsByClient } from '@/components/hooks/useFetchProjectsByClient';
import GoogleMapReact from 'google-map-react';

import JobDetailsStep from './JobDetailsStep';
import JobDescriptionStep from './JobDescriptionStep';
import JobTypeStep from './JobTypeStep';
import SalaryStep from './SalaryStep';
import EtaStep from './EtaStep';
import AddressStep from './AddressStep';

const PostJobs = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { clients } = useSelector(store => store.client);

    const [input, setInput] = useState({
        title: '',
        template: '',
        client: '',
        projectId: '',
        description: '',
        requiredTools: '',
        skills: '',
        totalSalary: '',
        rate: 0,
        rateType: 'fixed',
        jobType: '',
        experience: '',
        calculatedSalary: 0,
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        startTime: new Date(),
        endTime: new Date(),
        partTime: { base: '', hourlyHours: 0, dailyDays: 0, contractMonths: 0, weeklyDays: 0 },
        fullTime: { base: '', contractMonths: 0 },
    });
    const [jobId, setJobId] = useState('');
    const [status, setStatus] = useState('Draft');
    const goToStep = (step) => setCurrentStep(step);
    const nextStep = () => setCurrentStep((prev) => prev + 1);
    const prevStep = () => setCurrentStep((prev) => prev - 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    useEffect(() => {
        let newEndTime = new Date(input.startTime);
        let totalJobTime = '';
        let totalJobDuration = '';

        if (input.jobType === 'part-time') {
            const { base, hourlyHours, dailyDays, weeklyDays, contractMonths } = input.partTime;

            if (base === 'hourly' && hourlyHours) {
                newEndTime.setHours(newEndTime.getHours() + parseInt(hourlyHours));
                totalJobTime = 'hours';
                totalJobDuration = `${parseInt(hourlyHours)} hours`;
            } else if (base === 'daily' && dailyDays) {
                newEndTime.setDate(newEndTime.getDate() + parseInt(dailyDays));
                totalJobTime = 'days';
                totalJobDuration = `${parseInt(dailyDays)} days`;
            } else if (base === 'weekly' && weeklyDays) {
                newEndTime.setDate(newEndTime.getDate() + parseInt(weeklyDays) * 7);
                totalJobTime = 'weeks';
                totalJobDuration = `${parseInt(weeklyDays)} weeks`;
            } else if (base === 'contract' && contractMonths) {
                newEndTime.setMonth(newEndTime.getMonth() + parseInt(contractMonths));
                totalJobTime = 'months';
                totalJobDuration = `${parseInt(contractMonths)} months`;
            }
        } else if (input.jobType === 'full-time') {
            const { contractMonths } = input.fullTime;
            if (contractMonths) {
                newEndTime.setMonth(newEndTime.getMonth() + parseInt(contractMonths));
                totalJobTime = 'months';
                totalJobDuration = `${parseInt(contractMonths)} months`;
            }
        }

        setInput((prev) => ({
            ...prev,
            endTime: newEndTime,
            totalJobTime: totalJobTime,
            totalJobDuration: totalJobDuration
        }));

    }, [input.startTime, input.partTime, input.fullTime, input.jobType]);

    useEffect(() => {
        const calculateSalary = () => {
            let totalSalary = 0;
            if (input.rateType === 'fixed') {
                totalSalary = parseInt(input.rate);
            } else if (input.rateType === 'hourly') {
                if (input.jobType === 'part-time' && input.partTime.base === 'hourly') {
                    totalSalary = parseInt(input.rate) * parseInt(input.partTime.hourlyHours);
                } else if (input.partTime.base === 'daily') {
                    totalSalary = parseInt(input.rate) * parseInt(input.partTime.dailyDays);
                } else if (input.partTime.base === 'weekly') {
                    totalSalary = parseInt(input.rate) * (parseInt(input.partTime.weeklyDays) * 7);
                } else if (input.partTime.base === 'contract') {
                    totalSalary = parseInt(input.rate) * parseInt(input.partTime.contractMonths);
                }
            }

            setInput((prevState) => ({ ...prevState, calculatedSalary: totalSalary }));
        }
        calculateSalary();
    }, [input.rate, input.rateType, input.partTime, input.jobType]);

    const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);

    const submitHandler = async (e) => {
        e.preventDefault();

        const jobData = {
            title: input.title,
            template: input.template,
            clientName: input.client,
            projectName: input.projectId,
            description: input.description,
            requiredTools: input.requiredTools,
            skills: input.skills,
            jobType: input.jobType,
            partTimeOptions: input.jobType === 'part-time' ? input.partTime : undefined,
            fullTimeOptions: input.jobType === 'full-time' ? input.fullTime : undefined,
            totalSalary: input.calculatedSalary,
            street: input.street,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
            totalJobTime: input.totalJobTime,
            totalJobDuration: input.totalJobDuration,
            startTime: input.startTime,
            endTime: input.endTime,
            status: 'Active',
        };

        console.log("Job Data being sent:", jobData);

        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, jobData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            if (res.data.success && res.data.job && res.data.job._id) {
                toast.success(res.data.message);
                const newJobId = res.data.job._id;
                setJobId(newJobId);
                await sendJobCreatedNotification(newJobId);
                setStatus('Active');
                navigate(`/viewjob/${newJobId}`);
            } else {
                console.error("Job creation failed:", res.data?.message || "Unknown error");
                toast.error(res.data?.message || "Job creation failed.");
            }
        } catch (error) {
            console.error("Error posting job:", error.response ? error.response.data : error);
            const errorMessage = error.response ? error.response.data.message : 'An unexpected error occurred.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const sendJobCreatedNotification = async (newJobId) => {
        console.log("Sending notification for jobId:", newJobId);

        try {
            const jobDetails = await axios.get(`<span class="math-inline">\{JOB\_API\_END\_POINT\}/get/</span>{newJobId}`, { withCredentials: true });

            if (!jobDetails.data.success || !jobDetails.data.job) {
                console.warn("Failed to fetch job details:", jobDetails.data?.message || "No job data");
                return;
            }

            const job = jobDetails.data.job;
            const message = `A new job, ${job.title}, has been created!`;

            const notificationResponse =await axios.post(
                `${NOTIFICATION_API_END_POINT}/Job-create`,
                { message },
                { withCredentials: true }
            );

        if (notificationResponse.data.success) {
            console.log("Notification sent successfully");
        } else {
            console.warn("Failed to send job creation notification:", notificationResponse.data?.message || "Unknown error");
        }
    } catch (error) {
        console.error("Error sending job creation notification:", error);
    }
};

const saveAsDraft = async () => {
    const jobData = {
        title: input.title,
        template: input.template,
        clientName: input.client,
        projectName: input.projectId,
        description: input.description,
        requiredTools: input.requiredTools,
        skills: input.skills,
        jobType: input.jobType,
        partTimeOptions: input.jobType === 'part-time' ? input.partTime : undefined,
        fullTimeOptions: input.jobType === 'full-time' ? input.fullTime : undefined,
        totalSalary: input.calculatedSalary,
        street: input.street,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        totalJobTime: input.totalJobTime,
        totalJobDuration: input.totalJobDuration,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'Draft',
    };

    try {
        const res = await axios.post(`${JOB_API_END_POINT}/post`, jobData, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        });

        if (res.data.success && res.data.job && res.data.job._id) {
            toast.success(res.data.message);
            const newJobId = res.data.job._id;
            setJobId(newJobId);
            setStatus('Draft');
            // You might want to store the job ID in local storage here
            localStorage.setItem('draftJobId', newJobId);
        } else {
            console.error("Saving job as draft failed:", res.data?.message || "Unknown error");
            toast.error(res.data?.message || "Saving job as draft failed.");
        }
    } catch (error) {
        console.error("Error saving job as draft:", error);
        toast.error(error.response ? error.response.data.message : 'An unexpected error occurred.');
    }
};

// Automatically save as draft when the user is leaving the page
useEffect(() => {
    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        saveAsDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, [input]); // Include 'input' in the dependency array

// Fetch draft data when the component mounts
useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const draftJobId = searchParams.get('jobId');

    if (draftJobId) {
        const fetchDraftJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get-draft/${draftJobId}`, { withCredentials: true });
                if (res.data.success && res.data.job) {
                    setInput(res.data.job);
                    setStatus('Draft');
                    setJobId(draftJobId);
                }
            } catch (error) {
                console.error("Error fetching draft job:", error);
                toast.error(error.response ? error.response.data.message : 'An unexpected error occurred.');
            }
        };

        fetchDraftJob();
    }
}, [location.search]);


const renderStepContent = () => {
    switch (currentStep) {
        case 1:
            return <JobDetailsStep input={input} setInput={setInput} nextStep={nextStep} />;
        case 2:
            return <JobDescriptionStep input={input} setInput={setInput} nextStep={nextStep} prevStep={prevStep} />;
        case 3:
            return <JobTypeStep input={input} setInput={setInput} nextStep={nextStep} prevStep={prevStep} />;
        case 4:
            return <SalaryStep input={input} setInput={setInput} nextStep={nextStep} prevStep={prevStep} />;
        case 5:
            return <EtaStep input={input} setInput={setInput} nextStep={nextStep} prevStep={prevStep} />;
        case 6:
            return <AddressStep input={input} setInput={setInput} prevStep={prevStep} />;
        default:
            return null;
    }
};

return (
    <div>
        <div className="flex justify-between items-center bg-gray-100 p-4 mb-6 shadow-md">
            <div>
                <h2 className="text-lg font-semibold">Job ID: {jobId || '---'}</h2>
                <p>Status: <span className="font-bold">{status}</span></p>

                <Button onClick={saveAsDraft} className="bg-gray-500 text-white py-2 px-4 rounded-md mr-2">
                    Save as Draft
                </Button>
            </div>
            <div>
                
                {loading ? (
                    <Button className="bg-blue-500 text-white py-2 px-4 rounded-md" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                    </Button>
                ) : (
                    <Button onClick={submitHandler} className="bg-green-500 text-white py-2 px-4 rounded-md">
                        Post Job
                    </Button>
                )}
            </div>
        </div>

        <div className="flex">
            <JobFormStepper currentStep={currentStep} goToStep={goToStep} />

            <div className="w-3/4 p-8">
                <form>{renderStepContent()}</form>
            </div>
        </div>
    </div>
);
};

export default PostJobs;