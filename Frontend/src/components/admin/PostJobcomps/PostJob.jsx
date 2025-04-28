import React, { useState, useEffect, useCallback } from 'react';
import JobFormStepper from './sidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { JOB_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/components/utils/constant';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchProjectsByClient } from '@/components/hooks/useFetchProjectsByClient';

import JobDetailsStep from './JobDetailsStep';
import JobDescriptionStep from './JobDescriptionStep';
import JobTypeStep from './JobTypeStep';
import SalaryStep from './SalaryStep';
import EtaStep from './EtaStep';
import AddressStep from './AddressStep';
import styles from './PostJobs.module.css';
import Contacts from './Contacts';
import Attachments from './Attachements';
const CustomFields = React.lazy(() => import('./CustomFields'));
const JobTasks = React.lazy(() => import('./Tasks'));
const Shipments = React.lazy(() => import('./Shipments'));
const SelectionRules = React.lazy(() => import('./SelectionRule'));
const SmartAudit = React.lazy(() => import('./SmartAudit'));

const PostJobs = () => {
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
        attachments: [],
        contacts: [],
    });
    const [jobId, setJobId] = useState('');
    const [status, setStatus] = useState('Draft');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { clients } = useSelector((store) => store.client);
    const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);
    const [customFieldsEnabled, setCustomFieldsEnabled] = useState(false);
    const [advancedFieldsEnabled, setAdvancedFieldsEnabled] = useState(false);
    const [customFields, setCustomFields] = useState([]);
    const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [shipmentsData, setShipmentsData] = useState([]);
    const [SelectionRule, setSelectionRule] = useState({});
    const [auditRules, setAuditRules] = useState([]);

    const goToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const handleContactsChange = useCallback((newContacts) => {
        setInput(prevInput => ({
            ...prevInput,
            contacts: newContacts,
        }));
    }, []);

    const handleShipmentsChange = useCallback((newShipments) => {
        setShipmentsData(newShipments);
    }, []);
    const handleSelectionRulesChange = (rules) => { // Handler for selection rules
        setSelectionRule(rules);
    };

    useEffect(() => {
        // No direct calculation of endTime here anymore.
        // The EtaStep component will handle the duration input.
    }, [input.startTime, input.partTime, input.fullTime, input.jobType]);

    const handleAttachmentChange = (files) => {
        setInput(prevState => ({
            ...prevState,
            attachments: [...prevState.attachments, ...files],
        }));
    };

    const handleRemoveAttachment = (indexToRemove) => {
        setInput(prevState => ({
            ...prevState,
            attachments: prevState.attachments.filter((_, index) => index !== indexToRemove),
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();

        formData.append('title', input.title);
        formData.append('description', input.description);
        formData.append('skills', input.skills);
        formData.append('street', input.street);
        formData.append('city', input.city);
        formData.append('state', input.state);
        formData.append('postalCode', input.postalCode);
        formData.append('country', input.country);
        formData.append('jobType', input.jobType);
        formData.append('startTime', input.startTime ? input.startTime.toISOString() : '');
        formData.append('endTime', input.endTime ? input.endTime.toISOString() : '');
        formData.append('status', 'Active');

        if (input.template) formData.append('template', input.template);
        if (input.client) formData.append('clientName', input.client);
        if (input.projectId) formData.append('projectName', input.projectId);
        if (input.requiredTools) formData.append('requiredTools', input.requiredTools);
        if (input.contacts && Array.isArray(input.contacts)) {
            formData.append('contacts', JSON.stringify(input.contacts));
        } else {
            formData.append('contacts', JSON.stringify([]));
        }

        formData.append('rate', input.rate);
        formData.append('rateType', input.rateType);

        if (input.jobType === 'full-time' && input.rateType === 'contract' && input.fullTime?.contractMonths) {
            formData.append('fullTimeOptions[contractMonths]', input.fullTime.contractMonths);
        } else if (input.jobType === 'part-time' && input.partTime?.base) {
            formData.append('partTimeOptions[base]', input.partTime.base);
            if (input.partTime.base === 'hourly' && input.partTime.hourlyHours) {
                formData.append('partTimeOptions[hourlyHours]', input.partTime.hourlyHours);
            } else if (input.partTime.base === 'daily' && input.partTime.dailyDays) {
                formData.append('partTimeOptions[dailyDays]', input.partTime.dailyDays);
            } else if (input.partTime.base === 'contract' && input.partTime.contractMonths) {
                formData.append('partTimeOptions[contractMonths]', input.partTime.contractMonths);
            } else if (input.partTime.base === 'weekly' && input.partTime.weeklyDays) {
                formData.append('partTimeOptions[weeklyDays]', input.partTime.weeklyDays);
            }
        }

        input.attachments.forEach((file) => {
            formData.append('attachments', file);
        });

        formData.append('customFields', JSON.stringify(customFields));
        formData.append('tasks', JSON.stringify(tasks));
        if (shipmentsData && Array.isArray(shipmentsData)) {
            shipmentsData.forEach((shipment, index) => {
                formData.append(`shipments[${index}][shipmentNumber]`, shipment.shipmentNumber || '');
                formData.append(`shipments[${index}][status]`, shipment.status || '');
                formData.append(`shipments[${index}][trackingId]`, shipment.trackingId || '');
                if (shipment.picture instanceof File) {
                    formData.append(`shipments[${index}][picture]`, shipment.picture);
                } else if (typeof shipment.picture === 'string' && shipment.picture) {
                    // If it's already a URL, you might want to just send the URL or handle it differently on the backend
                    formData.append(`shipments[${index}][picture]`, shipment.picture);
                }
            });
        }
        formData.append('selectionRules', JSON.stringify(SelectionRules));

        formData.append('auditRules', JSON.stringify(auditRules)); 

        console.log('Form Data Contents:');
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            const res = await axios.post(`${JOB_API_END_POINT}/post`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
            const jobDetails = await axios.get(`${JOB_API_END_POINT}/get/${newJobId}`, { withCredentials: true });

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
            rate: input.rate,
            rateType: input.rateType,
            totalSalary: input.totalSalary,
            salary: input.salary,
            street: input.street,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
            startTime: input.startTime,
            endTime: input.endTime,
            status: 'Draft',
            attachments: input.attachments,
            contacts: input.contacts,
            customFields: customFields,
            tasks: tasks,
            shipments: shipmentsData,
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
    }, [input, customFields, tasks, shipmentsData]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const draftJobId = searchParams.get('jobId');

        if (draftJobId) {
            const fetchDraftJob = async () => {
                try {
                    const res = await axios.get(`${JOB_API_END_POINT}/get/${draftJobId}`, { withCredentials: true });
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
                                rate: job.salary?.partTime?.hourlyRate || job.salary?.fixed || job.salary?.partTime?.dailyRate || job.salary?.partTime?.contractRate || job.salary?.partTime?.weeklyRate || job.salary?.fullTime?.contractRate || '',
                                rateType: job.salary?.fixed ? 'fixed' : (job.salary?.fullTime?.contractRate ? 'contract' : (job.salary?.partTime?.hourlyRate ? 'hourly' : (job.salary?.partTime?.dailyRate ? 'daily' : (job.salary?.partTime?.weeklyRate ? 'weekly' : 'fixed')))),
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
                                attachments: job.attachments || [],
                                contacts: job.contacts || [],
                            });
                            setCustomFields(job.customFields || []);
                            setTasks(job.tasks || []);
                            setShipmentsData(job.shipments || []);
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

    return (
        <div className={styles.container}>
            <div className={styles.statusBar}>
                <div>
                    <h2 className="py-2 px-4 font-bold">Job ID: {jobId || '---'}</h2>
                    <p>Status: <span className="font-bold">{status}</span></p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {loading ? (
                        <Button className="bg-blue-500 text-white py-2 px-4 rounded-md mb-2" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting...
                        </Button>
                    ) : (
                        <Button onClick={submitHandler} className="bg-green-500 text-white py-2 px-4 rounded-md mb-2">
                            Post Job
                        </Button>
                    )}
                    <Button onClick={saveAsDraft} className="bg-gray-500 text-white py-2 px-4 rounded-md">
                        Save as Draft
                    </Button>
                </div>
            </div>
            <div className={styles.sidebarAndContent}>
                <div className={styles.sidebar}>
                    <JobFormStepper goToStep={goToSection} singlePage={true} setCustomFieldsEnabled={setCustomFieldsEnabled} setAdvancedFieldsEnabled={setAdvancedFieldsEnabled} />
                </div>
                <div className={styles.content}>
                    <div className={styles.formContainer}>
                        <form onSubmit={submitHandler}>
                            <div className={styles.section}>
                                <section id="job-details" className="mb-4">
                                    <h3 className={styles.sectionTitle}>Job Details</h3>
                                    <JobDetailsStep input={input} setInput={setInput} />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="job-description" className="mb-4">
                                    <h3 className={styles.sectionTitle}>Job Description</h3>
                                    <JobDescriptionStep input={input} setInput={setInput} />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="job-type" className="mb-4">
                                    <h3 className={styles.sectionTitle}>Job Type</h3>
                                    <JobTypeStep input={input} setInput={setInput} />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="salary-details" className="mb-4">
                                    <h3 className={styles.sectionTitle}>Salary / Pay Rates</h3>
                                    <SalaryStep
                                        input={input}
                                        setInput={setInput}
                                        jobType={input.jobType}
                                        partTime={input.partTime}
                                        fullTime={input.fullTime}
                                    />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="eta" className="mb-4">
                                    <h3 className={styles.sectionTitle}>ETA</h3>
                                    <EtaStep
                                        input={input}
                                        setInput={setInput}
                                        jobType={input.jobType}
                                        partTime={input.partTime}
                                        fullTime={input.fullTime}
                                        setEndTime={(time) => setInput({ ...input, endTime: time })}
                                    />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="address" className="mb-4">
                                    <h3 className={styles.sectionTitle}>Job Location</h3>
                                    <AddressStep input={input} setInput={setInput} />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="contacts" className="mb-4" style={{ display: 'block' }}>
                                    <h3 className={styles.sectionTitle}>Contacts</h3>
                                    <Contacts
                                        input={input}
                                        setInput={setInput}
                                    />
                                </section>
                            </div>

                            <div className={styles.section}>
                                <section id="attachments" className="mb-4" style={{ display: 'block' }}>
                                    <h3 className={styles.sectionTitle}>Attachments</h3>
                                    <Attachments
                                        attachments={input.attachments}
                                        onAttachmentChange={handleAttachmentChange}
                                        onRemoveAttachment={handleRemoveAttachment}
                                    />
                                </section>
                            </div>

                            {customFieldsEnabled && (
                                <div className={styles.section}>
                                    <section id="custom-fields" className="mb-4">
                                        <h3 className={styles.sectionTitle}>Custom Fields</h3>
                                        {customFieldsLoading ? (
                                            <div>Loading Custom Fields...</div>
                                        ) : (
                                            <React.Suspense fallback={<div>Loading Custom Fields...</div>}>
                                                <CustomFields fields={customFields} onChange={setCustomFields} />
                                            </React.Suspense>
                                        )}
                                    </section>
                                </div>
                            )}
                            {customFieldsEnabled && (
                                <div className={styles.section}>
                                    <section id="job-tasks" className="mb-4">
                                        <h3 className={styles.sectionTitle}>TaskList</h3>
                                        {customFieldsLoading ? (
                                            <div>Loading Tasks...</div>
                                        ) : (
                                            <React.Suspense fallback={<div>Loading Custom Task...</div>}>
                                                <JobTasks tasks={tasks} onChange={setTasks} />
                                            </React.Suspense>
                                        )}
                                    </section>
                                </div>
                            )}

                            {advancedFieldsEnabled && (
                                <>
                                    <div className={styles.section}>
                                        <section id="shipments" className="mb-4">
                                            <h3 className={styles.sectionTitle}>Shipments</h3>
                                            <React.Suspense fallback={<div>Loading Shipments...</div>}>
                                                <Shipments onShipmentsChange={handleShipmentsChange} initialShipments={shipmentsData} />
                                            </React.Suspense>
                                        </section>
                                    </div>

                                    <div className={styles.section}>
                                        <section id="shipments" className="mb-4">
                                            <h3 className={styles.sectionTitle}>Shipments</h3>
                                            <React.Suspense fallback={<div>Loading Shipments...</div>}>
                                                <SelectionRules onShipmentsChange={handleShipmentsChange} initialShipments={shipmentsData} />
                                            </React.Suspense>
                                        </section>
                                    </div>

                                    <div className={styles.section}>
                                        <section id="shipments" className="mb-4">
                                            <h3 className={styles.sectionTitle}>Shipments</h3>
                                            <React.Suspense fallback={<div>Loading Shipments...</div>}>
                                                <SmartAudit onShipmentsChange={handleShipmentsChange} initialShipments={shipmentsData} />
                                            </React.Suspense>
                                        </section>
                                    </div>

                                    
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostJobs;