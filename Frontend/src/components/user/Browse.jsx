import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import Workorder from "./Workorder";
import useGetAllJobs from "../Hooks/useGetAllJobs";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import {
    ChevronDown, ChevronUp, Search, SlidersHorizontal,
    MapPin, DollarSign, Briefcase, Building2, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const [showFilters, setShowFilters] = useState(true);

    const handleFilterChange = (name, value) => {
        setFilters({ ...filters, [name]: value });
    };

    const activeFilterCount = Object.entries(filters).filter(
        ([key, value]) => value && value !== "all" && value !== ""
    ).length;

    const filteredJobs = allJobs.filter((job) => {
        return (
            (filters.jobType && filters.jobType !== "all" ? job.jobType === filters.jobType : true) &&
            (filters.workType && filters.workType !== "all" ? job.workType === filters.workType : true) &&
            (filters.minSalary ? job.salary >= filters.minSalary : true) &&
            (filters.maxSalary ? job.salary <= filters.maxSalary : true) &&
            (filters.location ? job.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) : true)
        );
    });

    const resetFilters = () => {
        setFilters({ jobType: "all", workType: "all", minSalary: "", maxSalary: "", location: "" });
    };

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        };
    }, [dispatch]);

    return (
        <div className="flex-1 w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-0">
            {/* Background accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-cyan-100/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Discover opportunities that match your skills and preferences
                    </p>
                </motion.div>

                {/* Filter Card */}
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 mb-8 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <button
                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center gap-3">
                            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                            <span className="text-base font-semibold text-gray-800">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-bold text-white bg-blue-500 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </div>
                        <motion.div
                            animate={{ rotate: showFilters ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Job Type */}
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Job Type
                                            </label>
                                            <Select onValueChange={(value) => handleFilterChange("jobType", value)} value={filters.jobType}>
                                                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 rounded-xl">
                                                    <SelectValue placeholder="Select Job Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Job Types</SelectItem>
                                                    <SelectItem value="full-time">Full-Time</SelectItem>
                                                    <SelectItem value="part-time">Part-Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Work Type */}
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                <Building2 className="w-3.5 h-3.5" />
                                                Work Type
                                            </label>
                                            <Select onValueChange={(value) => handleFilterChange("workType", value)} value={filters.workType}>
                                                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 rounded-xl">
                                                    <SelectValue placeholder="Select Work Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Work Types</SelectItem>
                                                    <SelectItem value="remote">Remote</SelectItem>
                                                    <SelectItem value="onsite">Onsite</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Location */}
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                <MapPin className="w-3.5 h-3.5" />
                                                Location
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="text"
                                                    name="location"
                                                    placeholder="Search by city..."
                                                    value={filters.location}
                                                    onChange={(e) => handleFilterChange("location", e.target.value)}
                                                    className="pl-9 h-11 bg-gray-50 border-gray-200 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Min Salary */}
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                Min Salary
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    name="minSalary"
                                                    placeholder="Minimum..."
                                                    value={filters.minSalary}
                                                    onChange={(e) => handleFilterChange("minSalary", e.target.value)}
                                                    className="pl-9 h-11 bg-gray-50 border-gray-200 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Max Salary */}
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                Max Salary
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    name="maxSalary"
                                                    placeholder="Maximum..."
                                                    value={filters.maxSalary}
                                                    onChange={(e) => handleFilterChange("maxSalary", e.target.value)}
                                                    className="pl-9 h-11 bg-gray-50 border-gray-200 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Reset */}
                                        <div className="flex items-end">
                                            <Button
                                                variant="outline"
                                                className="w-full h-11 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl transition-colors"
                                                onClick={resetFilters}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Reset Filters
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Results Header */}
                <motion.div
                    className="flex items-center justify-between mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
                        </h2>
                    </div>
                </motion.div>

                {/* Jobs Grid */}
                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job, index) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                            >
                                <Workorder job={job} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-gray-100 mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
                        <p className="text-gray-500 mb-6">
                            Try adjusting your filters to see more results
                        </p>
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="rounded-xl"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Clear All Filters
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Browse;