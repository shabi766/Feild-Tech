import React, { useState, useEffect } from 'react';
import JobFormStepper from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { JOB_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/components/utils/constant';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchProjectsByClient } from '@/components/Hooks/useFetchProjectsByClient';

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

    const { clients } = useSelector((store) => store.client);

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
        // ... (endTime calculation logic)
    }, [input.startTime, input.partTime, input.fullTime, input.jobType]);

    const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);

    const submitHandler = async (e) => {
        e.preventDefault();
        let salary = {};
        let totalSalary = 0;

        if (input.rateType === 'fixed') {
            totalSalary = parseInt(input.rate);
            salary = { fixed: totalSalary };
        } else if (input.rateType === 'hourly') {
            if (input.jobType === 'part-time' && input.partTime && input.partTime.base === 'hourly') {
                totalSalary = parseInt(input.rate) * parseInt(input.partTime.hourlyHours);
                salary = { partTime: { hourlyRate: parseInt(input.rate) } };
            } else if (input.jobType === 'part-time' && input.partTime && input.partTime.base === 'daily') {
                totalSalary = parseInt(input.rate) * parseInt(input.partTime.dailyDays);
                salary = { partTime: { dailyRate: parseInt(input.rate) } };
            } else if (input.jobType === 'part-time' && input.partTime && input.partTime.base === 'contract') {
                totalSalary = parseInt(input.rate) * parseInt(input.partTime.contractMonths);
                salary = { partTime: { contractRate: parseInt(input.rate) } };
            } else if (input.jobType === 'part-time' && input.partTime && input.partTime.base === 'weekly') {
                totalSalary = parseInt(input.rate) * (parseInt(input.partTime.weeklyDays) * 7);
                salary = { partTime: { weeklyRate: parseInt(input.rate) } };
            }
        }

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
            rate: input.rate,
            rateType: input.rateType,
            totalSalary: totalSalary,
            salary: salary,
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
        console.log('Job Data being sent:', jobData);

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
                console.error('Job creation failed:', res.data?.message || 'Unknown error');
                toast.error(res.data?.message || 'Job creation failed.');
            }
        } catch (error) {
            console.error('Error posting job:', error.response ? error.response.data : error);
            const errorMessage = error.response ? error.response.data.message : 'An unexpected error occurred.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const sendJobCreatedNotification = async (newJobId) => {
        console.log('Sending notification for jobId:', newJobId);

        try {
            const jobDetails = await axios.get(`<span class="math-inline">\{JOB\_API\_END\_POINT\}/get/</span>{newJobId}`, { withCredentials: true });

            if (!jobDetails.data.success || !jobDetails.data.job) {
                console.warn('Failed to fetch job details:', jobDetails.data?.message || 'No job data');
                return;
            }

            const job = jobDetails.data.job;
            const message = `A new job, ${job.title}, has been created!`;

            const notificationResponse = await axios.post(
                `${NOTIFICATION_API_END_POINT}/Job-create`,
                { message },
                { withCredentials: true }
            );

            if (notificationResponse && notificationResponse.data.success) {
                console.log('Notification sent successfully');
            } else {
                console.warn('Failed to send job creation notification:', notificationResponse?.data?.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error sending job creation notification:', error);
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
            totalSalary: input.totalSalary,
            salary: input.salary,
            street: input.street,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
            totalJobTime: input.totalJobTime,
            totalJobDuration:input.totalJobDuration,
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
                localStorage.setItem('draftJobId', newJobId);
            } else {
                console.error('Saving job as draft failed:', res.data?.message || 'Unknown error');
                toast.error(res.data?.message || 'Saving job as draft failed.');
            }
        } catch (error) {
            console.error('Error saving job as draft:', error);
            toast.error(error.response ? error.response.data.message : 'An unexpected error occurred.');
        }
    };

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
    }, [input]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const draftJobId = searchParams.get('jobId');

        if (draftJobId) {
            const fetchDraftJob = async () => {
                try {
                    const res = await axios.get(`${JOB_API_END_POINT}/workorders/draft/${draftJobId}`, { withCredentials: true });
                    if (res.data.success && res.data.job) {
                        if (res.data.job) {
                            const job = res.data.job;
                            setInput({
                                title: job.title || '',
                                template: job.template || '',
                                client: job.clientName ? job.clientName._id : '',
                                projectId: job.projectName ? job.projectName._id : '',
                                description: job.description || '',
                                requiredTools: job.requiredTools ? job.requiredTools.join(', ') : '',
                                skills: job.skills ? job.skills.join(', ') : '',
                                totalSalary: job.totalSalary || '',
                                rate: job.salary?.partTime?.hourlyRate || job.salary?.fixed || job.salary?.partTime?.dailyRate || job.salary?.partTime?.contractRate || job.salary?.partTime?.weeklyRate || '',
                                rateType: job.salary?.fixed ? 'fixed' : 'hourly',
                                street: job.location?.street || '',
                                city: job.location?.city || '',
                                state: job.location?.state || '',
                                postalCode: job.location?.postalCode || '',
                                country: job.location?.country || '',
                                startTime: job.startTime ? new Date(job.startTime) : new Date(),
                                endTime: job.endTime ? new Date(job.endTime) : new Date(),
                                jobType: job.jobType || '',
                                partTime: job.partTimeOptions || { base: '', hourlyHours: 0, dailyDays: 0, contractMonths: 0, weeklyDays: 0 },
                                fullTime: job.fullTimeOptions || { base: '', contractMonths: 0 },
                                totalJobTime: job.totalJobTime || '',
                                totalJobDuration: job.totalJobDuration || '',
                            });
                            setStatus('Draft');
                            setJobId(draftJobId.slice(-6));
                        } else {
                            console.error('Draft job data is missing');
                            toast.error('Draft job data is missing');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching draft job:', error);
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
                return <EtaStep input={input} setInput={setInput} nextStep={nextStep} prevStep={prevStep} jobType={input.jobType} partTime={input.partTime} fullTime={input.fullTime} />;
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