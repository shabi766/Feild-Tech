import React, { useEffect } from 'react';
import Navbar from '../shared/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import Workorder from './Workorder';
import useGetAllJobs from '../Hooks/useGetAllJobs';

const Browse = () => {
    useGetAllJobs();
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery("")); // Reset search query on unmount
        }
    }, [dispatch]);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10'>
                <h1 className='font-bold text-xl my-10'>Search Results ({allJobs.length})</h1>
                {
                    allJobs.length > 0 ? (
                        <div className='grid grid-cols-3 gap-4'>
                            {allJobs.map((job) => (
                                <Workorder key={job._id} job={job} />
                            ))}
                        </div>
                    ) : (
                        <div className='text-center text-gray-500'>
                            <h2>No jobs found matching your criteria.</h2>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default Browse;
