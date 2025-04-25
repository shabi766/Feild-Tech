import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, Eye, MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const [activeTab, setActiveTab] = useState('All');
    const navigate = useNavigate();

    const jobStatuses = ['All', 'Active', 'Draft', 'Assigned', 'Pending', 'In Progress','Done', 'Complete', 'Cancelled'];

    useEffect(() => {
        const filteredJobs = allAdminJobs.filter((job) => {
            const matchesSearch = !searchJobByText ||
                job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                job?.Company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());

            const matchesStatus = activeTab === 'All' || job?.status === activeTab;

            return matchesSearch && matchesStatus;
        });

        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText, activeTab]);

    const handleJobClick = (jobId, status) => {
        if (status === 'Draft') {
            navigate(`/admin/jobs/create?jobId=${jobId}`); // Navigate to create with jobId as query
        } else {
            navigate(`/viewjob/${jobId}`);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-wrap gap-3 mb-6">
                {jobStatuses.map((status) => (
                    <Button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        variant={activeTab === status ? 'solid' : 'outline'}
                        className={`transition-all duration-200 ${
                            activeTab === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        } hover:bg-blue-500 hover:text-white rounded-lg px-4 py-2 shadow-md`}
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <Table className="bg-white shadow-md rounded-lg overflow-hidden">
                <TableCaption className="text-lg font-semibold text-gray-700">
                    A list of your recent posted jobs
                </TableCaption>
                <TableHeader className="bg-blue-600 text-white">
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs?.map((job) => (
                        <TableRow
                            key={job._id}
                            className={`hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
                                job.status === 'Draft' ? 'bg-yellow-100' : ''
                            }`}
                        >
                            <TableCell onClick={() => handleJobClick(job._id, job.status)} className="cursor-pointer">
                                {job?.Company?.name}
                            </TableCell>
                            <TableCell onClick={() => handleJobClick(job._id, job.status)} className="cursor-pointer">
                                {job?.title}
                            </TableCell>
                            <TableCell onClick={() => handleJobClick(job._id, job.status)} className="cursor-pointer">
                                {job?.createdAt.split("T")[0]}
                            </TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger>
                                        <MoreHorizontal className="cursor-pointer text-gray-600 hover:text-blue-600" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32 p-2 border border-gray-300 rounded-lg shadow-lg">
                                        <div
                                            onClick={() => navigate(`/admin/jobs/${job._id}`)}
                                            className='flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded'
                                        >
                                            <Edit2 className='w-4 text-blue-500' />
                                            <span>Edit</span>
                                        </div>
                                        <div
                                            onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                                            className='flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded mt-1'
                                        >
                                            <Eye className='w-4 text-green-500' />
                                            <span>Applicants</span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdminJobsTable;