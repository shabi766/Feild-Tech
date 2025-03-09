import React, { useState, useEffect } from 'react';

import JobFormStepper from '../admin/sidebar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { JOB_API_END_POINT, NOTIFICATION_API_END_POINT, PROJECT_API_END_POINT } from '../utils/constant';
import { useNavigate } from 'react-router-dom';
import GoogleMapReact from 'google-map-react';
import { useFetchProjectsByClient } from '../hooks/useFetchProjectsByClient';
import Footer from '../shared/Footer';

const PostJobs = () => {
    const [currentStep, setCurrentStep] = useState(1); // Track the current step
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                totalJobDuration = `${parseInt(dailyDays)} days`; // For display
            } else if (base === 'weekly' && weeklyDays) {
                newEndTime.setDate(newEndTime.getDate() + parseInt(weeklyDays) * 7); 
                totalJobTime = 'weeks'; // For validation
                totalJobDuration = `${parseInt(weeklyDays)} weeks`; // For display
            } else if (base === 'contract' && contractMonths) {
                newEndTime.setMonth(newEndTime.getMonth() + parseInt(contractMonths));
                totalJobTime = 'months'; // For validation
                totalJobDuration = `${parseInt(contractMonths)} months`; // For display
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
            const jobDetails = await axios.get(`${JOB_API_END_POINT}/get/${newJobId}`, { withCredentials: true });

            if (!jobDetails.data.success || !jobDetails.data.job) { 
                console.warn("Failed to fetch job details:", jobDetails.data?.message || "No job data");
                return;
            }

            const job = jobDetails.data.job;
            const message = `A new job, ${job.title}, has been created!`;

            const notificationResponse = await axios.post(
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

    const renderMap = () => {
        const mapOptions = {
            center: {
                lat: 40.730610,
                lng: -73.935242,
            },
            zoom: 12,
        };

        return (
            <div style={{ height: '300px', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_API_KEY' }}
                    defaultCenter={mapOptions.center}
                    defaultZoom={mapOptions.zoom}
                />
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h2 className="font-bold text-lg mb-2">Title</h2>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={handleChange}
                                className="my-2"
                            />
                        </div>
                        <div>
                            <Label>Template</Label>
                            <Select onValueChange={(value) => setInput({ ...input, template: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Template1">Template 1</SelectItem>
                                        <SelectItem value="Template2">Template 2</SelectItem>
                                        <SelectItem value="Template3">Template 3</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className='mb-4'>
                                <label htmlFor='client' className='block text-sm font-medium text-gray-700'>
                                    Select Client <span className='text-red-500'>*</span>
                                </label>
                                <select
                                    id='client'
                                    className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                                    name='clientName'
                                    value={input.clientName}
                                    onChange={(e) => setInput({ ...input, client: e.target.value })}
                                    required
                                >
                                    <option value=''>Select a client</option>
                                    {clients.map((client) => (
                                        <option key={client._id} value={client._id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Projects Dropdown */}
                            {projectLoading ? (
                                <p>Loading projects...</p>
                            ) : projectError ? (
                                <p className="text-red-500">{projectError}</p>
                            ) : (
                                <div className='mb-4'>
                                    <label htmlFor='project' className='block text-sm font-medium text-gray-700'>
                                        Select Project <span className='text-red-500'>*</span>
                                    </label>
                                    {projects.length > 0 ? (
                                        <select
                                            id='project'
                                            className='mt-1 block w-full border border-gray-300 rounded-md p-2'
                                            name='projectName'
                                            value={input.projectName}
                                            onChange={(e) => setInput({ ...input, projectId: e.target.value })}
                                            required
                                        >
                                            <option value=''>Select a project</option>
                                            {projects.map((project) => (
                                                <option key={project._id} value={project._id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm text-gray-500">No projects registered under this client.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                            Continue
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="font-bold text-lg mb-2">Job Description</h2>
                        <div>
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={handleChange}
                                className="my-2 w-full border rounded-md resize-none"
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label>Required Tools</Label>
                            <Input
                                type="text"
                                name="requiredTools"
                                value={input.requiredTools}
                                onChange={handleChange}
                                placeholder="Comma-separated"
                                className="my-2"
                            />
                        </div>
                        <div>
                            <Label>Skills</Label>
                            <Input
                                type="text"
                                name="skills"
                                value={input.skills}
                                onChange={handleChange}
                                placeholder="Comma-separated"
                                className="my-2"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">
                                Back
                            </button>
                            <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2 className="font-bold text-lg mb-2">Job Type</h2>
                        <div>
                            <Label>Job Type</Label>
                            <Select onValueChange={(value) => setInput({ ...input, jobType: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Job Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="part-time">Part-Time</SelectItem>
                                        <SelectItem value="full-time">Full-Time</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Conditionally Render Based on Job Type */}
                        {input.jobType === 'part-time' && (
                            <>
                                <div className="mt-4">
                                    <Label>Base Type</Label>
                                    <Select onValueChange={(value) => setInput({ ...input, partTime: { ...input.partTime, base: value } })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Part-Time Base" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="hourly">Hourly</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Conditionally render part-time options */}
                                {input.partTime.base === 'hourly' && (
                                    <div className="mt-4">
                                        <Label>Hourly Hours</Label>
                                        <Input
                                            type="number"
                                            name="hourlyHours"
                                            value={input.partTime.hourlyHours}
                                            onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, hourlyHours: e.target.value } })}
                                            placeholder="Enter hours"
                                        />
                                    </div>
                                )}
                                {input.partTime.base === 'daily' && (
                                    <div className="mt-4">
                                        <Label>Daily Days</Label>
                                        <Input
                                            type="number"
                                            name="dailyDays"
                                            value={input.partTime.dailyDays}
                                            onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, dailyDays: e.target.value } })}
                                            placeholder="Enter days"
                                        />
                                    </div>
                                )}
                                {input.partTime.base === 'weekly' && (
                                    <div className="mt-4">
                                        <Label>Weekly Days</Label>
                                        <Input
                                            type="number"
                                            name="weeklyDays"
                                            value={input.partTime.weeklyDays}
                                            onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, weeklyDays: e.target.value } })}
                                            placeholder="Enter weeks"
                                        />
                                    </div>
                                )}
                                {input.partTime.base === 'contract' && (
                                    <div className="mt-4">
                                        <Label>Contract Months</Label>
                                        <Input
                                            type="number"
                                            name="contractMonths"
                                            value={input.partTime.contractMonths}
                                            onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, contractMonths: e.target.value } })}
                                            placeholder="Enter months"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {input.jobType === 'full-time' && (
                            <div className="mt-4">
                                <Label>Contract Months</Label>
                                <Input
                                    type="number"
                                    name="contractMonths"
                                    value={input.fullTime.contractMonths}
                                    onChange={(e) => setInput({ ...input, fullTime: { ...input.fullTime, contractMonths: e.target.value } })}
                                    placeholder="Enter months"
                                />
                            </div>
                        )}

                        <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                            Continue
                        </button>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h2 className="font-bold text-lg mb-2">Salary</h2>
                        <div className="mt-4">
                            <Label>Rate Type</Label>
                            <Select onValueChange={(value) => setInput({ ...input, rateType: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Rate Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                                        <SelectItem value="hourly">Per Hour</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mt-4">
                            <Label>Rate</Label>
                            <Input
                                type="number"
                                name="rate"
                                value={input.rate}
                                onChange={handleChange}
                                placeholder={`Enter ${input.rateType === 'hourly' ? 'hourly' : 'fixed'} rate`}
                            />
                        </div>


                        <div className="mt-4">
                            <Label>Calculated Salary</Label>
                            <Input
                                type="number"
                                name="TotalSalary"
                                value={input.calculatedSalary}
                                readOnly
                                className="my-2"
                            />
                        </div>


                        <div className="flex justify-between">
                            <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">
                                Back
                            </button>
                            <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <h2 className="font-bold text-lg mb-2">ETA</h2>
                        <div>
                            <Label>Start Time</Label>
                            <div className="relative flex items-center">
                                <DatePicker
                                    selected={input.startTime}
                                    onChange={(date) => setInput({ ...input, startTime: date })}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <FaCalendarAlt className="absolute right-8 text-gray-500" />
                                <FaClock className="absolute right-2 text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <div className="relative flex items-center">
                                <DatePicker
                                    selected={input.endTime}
                                    onChange={(date) => setInput({ ...input, endTime: date })}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <FaCalendarAlt className="absolute right-8 text-gray-500" />
                                <FaClock className="absolute right-2 text-gray-500" />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">
                                Back
                            </button>
                            <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div>
                        <h2 className="font-bold text-lg mb-2">Address</h2>
                        <div>
                            <Label>Street</Label>
                            <Input
                                type="text"
                                name="street"
                                value={input.street}
                                onChange={handleChange}
                                className="my-2"
                            />
                        </div>
                        <div>
                            <Label>City</Label>
                            <Input
                                type="text"
                                name="city"
                                value={input.city}
                                onChange={handleChange}
                                className="my-2"
                            />
                        </div>
                        <div>
                            <Label>State</Label>
                            <Input
                                type="text"
                                name="state"
                                value={input.state}
                                onChange={handleChange}
                                className="my-2"
                            />
                        </div>
                        <div>
                            <Label>Postal Code</Label>
                            <Input
                                type="text"
                                name="postalCode"
                                value={input.postalCode}
                                onChange={handleChange}
                                className="my-2"
                            />
                        </div>
                        <div>
                            <Label>Country</Label>
                            <Input
                                type="text"
                                name="country"
                                value={input.country}
                                onChange={handleChange}
                                className="my-2"
                            />
                        </div>
                        <div className="mt-6">
                            <h3 className="font-semibold text-lg mb-2">Location Map</h3>
                            {renderMap()}
                        </div>
                        <div className="flex justify-between">
                            <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">
                                Back
                            </button>
                        </div>
                    </div>
                );
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
