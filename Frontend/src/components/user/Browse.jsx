import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import Workorder from "./Workorder";
import useGetAllJobs from "../Hooks/useGetAllJobs";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const Browse = () => {
    useGetAllJobs();
    const dispatch = useDispatch();
    const { allJobs } = useSelector((store) => store.job);

    const [filters, setFilters] = useState({
        jobType: "all",
        workType: "all",
        minSalary: "",
        maxSalary: "",
        location: ""
    });

    const [showFilters, setShowFilters] = useState(true); // State to control filter visibility

    const handleFilterChange = (name, value) => {
        setFilters({ ...filters, [name]: value });
    };

    const filteredJobs = allJobs.filter((job) => {
        return (
            (filters.jobType && filters.jobType !== "all" ? job.jobType === filters.jobType : true) &&
            (filters.workType && filters.workType !== "all" ? job.workType === filters.workType : true) &&
            (filters.minSalary ? job.salary >= filters.minSalary : true) &&
            (filters.maxSalary ? job.salary <= filters.maxSalary : true) &&
            (filters.location ? job.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) : true)
        );
    });

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        };
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Collapsable Filter Bar */}
                <div className="bg-white p-6 shadow-md rounded-lg mb-6 border border-gray-300">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                        <h2 className="text-lg font-semibold text-gray-800">🔍 Filter Jobs</h2>
                        {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />} {/* Toggle icon */}
                    </div>
                    {/* Conditionally render filters */}
                    {showFilters && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            <Select onValueChange={(value) => handleFilterChange("jobType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Job Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Job Types</SelectItem>
                                    <SelectItem value="full-time">Full-Time</SelectItem>
                                    <SelectItem value="part-time">Part-Time</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Work Type */}
                            <Select onValueChange={(value) => handleFilterChange("workType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Work Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Work Types</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="onsite">Onsite</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Salary Range */}
                            <Input
                                type="number"
                                name="minSalary"
                                placeholder="Min Salary"
                                value={filters.minSalary}
                                onChange={(e) => handleFilterChange("minSalary", e.target.value)}
                            />
                            <Input
                                type="number"
                                name="maxSalary"
                                placeholder="Max Salary"
                                value={filters.maxSalary}
                                onChange={(e) => handleFilterChange("maxSalary", e.target.value)}
                            />

                            {/* Location */}
                            <Input
                                type="text"
                                name="location"
                                placeholder="Search by City"
                                value={filters.location}
                                onChange={(e) => handleFilterChange("location", e.target.value)}
                            />

                            {/* Reset Button */}
                            <Button
                                className="col-span-1 bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => setFilters({ jobType: "all", workType: "all", minSalary: "", maxSalary: "", location: "" })}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    )}
                </div>

                <h1 className="font-bold text-xl mb-6">
                    Showing {filteredJobs.length} Jobs
                </h1>

                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <Workorder key={job._id} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <h2>No jobs found matching your criteria.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Browse;