import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Check, X } from 'lucide-react';
import axios from 'axios';
import { JOB_API_END_POINT } from '../utils/constant';
import * as Tooltip from '@radix-ui/react-tooltip';
import { toast } from 'sonner';

const ShowJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('Draft');
    const [isEditing, setIsEditing] = useState({});
    const [editedValues, setEditedValues] = useState({});
    const [jobType, setJobType] = useState('part-time');
    const [salaryType, setSalaryType] = useState('hourly');

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${JOB_API_END_POINT}/get/${id}`, { withCredentials: true });
                if (response.data.success) {
                    setJob(response.data.job);
                    setStatus(response.data.job.status || 'Draft');
                    setJobType(response.data.job.jobType || 'part-time');
                    setSalaryType(response.data.job.salary?.partTime?.salaryType || 'hourly');
                } else {
                    setJob(null);
                }
            } catch (error) {
                console.error('Error fetching job details:', error);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    const handleEditClick = (field) => {
        setIsEditing({ ...isEditing, [field]: true });
        setEditedValues({ ...editedValues, [field]: job[field] });
    };

    const handleSaveEdit = async (field) => {
        try {
            setJob({ ...job, [field]: editedValues[field] });
            setIsEditing({ ...isEditing, [field]: false });
            await axios.put(`${JOB_API_END_POINT}/update/${id}`, { [field]: editedValues[field] }, { withCredentials: true });
            console.log(`${field} updated successfully`);
        } catch (error) {
            console.error(`Error saving ${field}:`, error);
        }
    };

    const handleCancelEdit = (field) => {
        setIsEditing({ ...isEditing, [field]: false });
    };

    const calculateTotalSalary = () => {
        let totalSalary = '---';
        let duration = '';

        if (jobType === 'part-time') {
            const rate = job?.salary?.partTime?.[`${salaryType}Rate`] || 0;
            const amount = job?.salary?.partTime?.amount || 0;

            if (salaryType === 'hourly') {
                totalSalary = `$${rate * amount}`;
                duration = `${amount} hours`;
            } else if (salaryType === 'daily') {
                totalSalary = `$${rate * amount}`;
                duration = `${amount} days`;
            } else if (salaryType === 'weekly') {
                totalSalary = `$${rate * amount}`;
                duration = `${amount} weeks`;
            }
        } else if (jobType === 'full-time') {
            totalSalary = `$${job?.salary?.fullTime?.monthlySalary || '---'}`;
            duration = 'Full-time';
        }

        return { totalSalary, duration };
    };

    const renderSalaryOptions = () => {
        if (jobType === 'part-time') {
            return (
                <div className="flex flex-col mt-4">
                    <label htmlFor="salaryType" className="text-gray-600 font-medium">Salary Type:</label>
                    <select
                        id="salaryType"
                        value={salaryType}
                        onChange={(e) => setSalaryType(e.target.value)}
                        className="border rounded-md p-2 mt-2"
                    >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                    <p className="text-gray-700 mt-2">Rate: ${job?.salary?.partTime?.[`${salaryType}Rate`] || '---'}</p>
                    <p className="text-gray-700">Duration: {job?.salary?.partTime?.amount || '---'} {salaryType}</p>
                </div>
            );
        }

        return jobType === 'full-time' ? (
            <p className="mt-4 text-gray-700">Monthly Salary: ${job?.salary?.fullTime?.monthlySalary || '---'}</p>
        ) : '---';
    };

    const renderStatusBar = () => {
        const { totalSalary, duration } = calculateTotalSalary();
        return (
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-md mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Job ID: {job?._id?.slice(-4) || '---'}</h2>
                    <p className="font-semibold">Status: {status}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">Salary: {totalSalary}</h2>
                    <p className="text-sm opacity-80">for {duration}</p>
                </div>
            </div>
        );
    };

    const renderEditableSection = (field, label, isComplex = false) => (
        <div className="mt-6 border-b pb-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
                {!isEditing[field] ? (
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Edit2 className="cursor-pointer text-blue-600 hover:scale-105 transition-transform" onClick={() => handleEditClick(field)} />
                        </Tooltip.Trigger>
                        <Tooltip.Content sideOffset={5} className="bg-gray-700 text-white p-2 rounded-md shadow-md">
                            Edit
                            <Tooltip.Arrow className="fill-current text-gray-700" />
                        </Tooltip.Content>
                    </Tooltip.Root>
                ) : (
                    <div className="flex gap-2">
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <Check className="cursor-pointer text-green-500 hover:scale-105 transition-transform" onClick={() => handleSaveEdit(field)} />
                            </Tooltip.Trigger>
                            <Tooltip.Content sideOffset={5} className="bg-gray-700 text-white p-2 rounded-md shadow-md">
                                Save
                                <Tooltip.Arrow className="fill-current text-gray-700" />
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <X className="cursor-pointer text-red-500 hover:scale-105 transition-transform" onClick={() => handleCancelEdit(field)} />
                            </Tooltip.Trigger>
                            <Tooltip.Content sideOffset={5} className="bg-gray-700 text-white p-2 rounded-md shadow-md">
                                Cancel
                                <Tooltip.Arrow className="fill-current text-gray-700" />
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </div>
                )}
            </div>
            {!isEditing[field] ? (
                isComplex ? <p className="text-gray-700 mt-2">{renderComplexValue(job[field])}</p> : <p className="text-gray-700 mt-2">{job?.[field] || '---'}</p>
            ) : (
                <input
                    type="text"
                    value={editedValues[field] || ''}
                    onChange={(e) => setEditedValues({ ...editedValues, [field]: e.target.value })}
                    className="border rounded-md p-2 w-full mt-2"
                />
            )}
        </div>
    );

    const renderComplexValue = (fieldValue) => fieldValue ? fieldValue.name : '---';

    if (loading) return <p>Loading job details...</p>;

    return (

        <div>
           
            <Tooltip.Provider>
            <div className="max-w-3xl mx-auto bg-gray-100 p-8 rounded-lg shadow-md">
                {renderStatusBar()}
                <div className="bg-white p-6 rounded-lg shadow-md transition duration-300">
                    {job ? (
                        <>
                            {renderEditableSection('title', 'Title')}
                            {renderEditableSection('description', 'Job Description')}
                            {renderEditableSection('client', 'Client', true)}
                            {renderEditableSection('project', 'Project', true)}
                            {renderEditableSection('jobType', 'Job Type')}
                            {renderSalaryOptions()}
                            {renderEditableSection('startTime', 'ETA Start Time')}
                            {renderEditableSection('endTime', 'ETA End Time')}
                            {renderEditableSection('location.street', 'Address')}
                            {renderEditableSection('skills', 'Skills')}
                            {renderEditableSection('requiredTools', 'Required Tools')}
                        </>
                    ) : (
                        <p className="text-gray-600">No job details found.</p>
                    )}
                </div>
            </div>
        </Tooltip.Provider>
        </div>
        
        
        
    );
};

export default ShowJob;
