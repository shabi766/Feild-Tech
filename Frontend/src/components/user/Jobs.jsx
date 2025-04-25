import React, { useEffect, useState } from 'react';

import { motion } from "framer-motion";
import Workorder from '../user/Workorder.jsx';
import { useSelector } from 'react-redux';
import FilterCard from '../user/Filtercard.jsx';

const Jobs = () => {
    // Accessing jobs and search query from Redux store
    const { allJobs = [], searchedQuery } = useSelector(store => store.job);  // Default allJobs to an empty array if undefined
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        // Ensure searchedQuery is a string or an empty string
        const query = searchedQuery ? searchedQuery.toString().toLowerCase() : '';

        if (query) {
            const filteredJobs = allJobs.filter((job) => {
                const { street, city, state, postalCode, country } = job?.location || {};
                // Create a full address string to search within
                const fullAddress = `${street || ''} ${city || ''} ${state || ''} ${postalCode || ''} ${country || ''}`.toLowerCase();

                return job.title.toLowerCase().includes(query) ||
                    job.description.toLowerCase().includes(query) ||
                    fullAddress.includes(query); // Search in the full address
            });
            setFilterJobs(filteredJobs);
        } else {
            // No query, show all jobs
            setFilterJobs(allJobs);
        }
    }, [allJobs, searchedQuery]);  // Effect runs when allJobs or searchedQuery changes

    return (
        <div>
           
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-20%'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? (
                            <span>Job not found</span>
                        ) : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                                <div className='grid grid-cols-3 gap-4'>
                                    {filterJobs.map((job) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.3 }}
                                            key={job?._id}>
                                            <Workorder job={job} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default Jobs;
