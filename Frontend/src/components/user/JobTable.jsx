import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import axios from "axios";
import { JOB_API_END_POINT } from "../utils/constant";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";

const JobTable = () => {
    const { user } = useSelector((store) => store.auth);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const jobStatuses = ["All", "Applied", "Assigned", "Done", "In Progress", "Completed"];

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${JOB_API_END_POINT}/technician-jobs`, {
                    withCredentials: true,
                });

                const appliedJobs = response.data?.appliedJobs || [];
                const assignedJobs = response.data?.assignedJobs || [];
                const inProgressJobs = response.data?.inProgressJobs || [];
                const doneJobs = response.data?.doneJobs || [];
                const completedJobs = response.data?.completedJobs || [];

                switch (activeTab) {
                    case "All":
                        setJobs([...appliedJobs, ...assignedJobs, ...doneJobs, ...completedJobs, ...inProgressJobs]);
                        break;
                    case "Applied":
                        setJobs(appliedJobs);
                        break;
                    case "Assigned":
                        setJobs(assignedJobs);
                        break;
                    case "In Progress":
                        setJobs(inProgressJobs);
                        break;
                    case "Done":
                        setJobs(doneJobs);
                        break;
                    case "Completed":
                        setJobs(completedJobs);
                        break;
                    default:
                        setJobs([]);
                }
            } catch (err) {
                console.error("Error fetching jobs:", err);
                setError(err.message || "Failed to fetch jobs.");
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [activeTab, user.token]);

    if (loading) {
        return <div className="p-6">Loading jobs...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>;
    }

    const handleJobClick = (jobId) => {
        navigate(`/description/${jobId}`);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-wrap gap-3 mb-6">
                {jobStatuses.map((status) => (
                    <Button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        variant={activeTab === status ? "solid" : "outline"}
                        className={`transition-all duration-200 ${
                            activeTab === status ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                        } hover:bg-blue-500 hover:text-white rounded-lg px-4 py-2 shadow-md`}
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <Table className="bg-white shadow-md rounded-lg overflow-hidden">
                <TableCaption className="text-lg font-semibold text-gray-700">Your Job History</TableCaption>
                <TableHeader className="bg-blue-600 text-white">
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.map((job) => (
                        <TableRow key={job._id} className="hover:bg-gray-100 transition-colors duration-200">
                            <TableCell onClick={() => handleJobClick(job._id)} className="cursor-pointer">
                                {job.title || "N/A"}
                            </TableCell>
                            <TableCell>{job.createdBy?.fullname || "Unknown"}</TableCell>
                            <TableCell>{new Date(job.startTime || 0).toLocaleString()}</TableCell>
                            <TableCell>{new Date(job.endTime || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger>
                                        <MoreHorizontal className="cursor-pointer text-gray-600 hover:text-blue-600" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-32 p-2 border border-gray-300 rounded-lg shadow-lg">
                                        <div
                                            onClick={() => navigate(`/description/${job._id}/edit`)}
                                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded"
                                        >
                                            <Edit2 className="w-4 text-blue-500" />
                                            <span>Edit</span>
                                        </div>
                                        <div
                                            onClick={() => navigate(`/description/${job._id}`)}
                                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded mt-1"
                                        >
                                            <Eye className="w-4 text-green-500" />
                                            <span>View</span>
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

export default JobTable;