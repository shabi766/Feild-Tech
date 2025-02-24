import React from 'react';
import LatestJobCards from '../user/LatestJobCards';
import { useSelector } from 'react-redux';


const LatestJobs = () => {

    const { allJobs } = useSelector(store => store.job);
  

    return (
        <div className='max-w-7xl mx-auto my-20'>
            <h1 className='text-4xl font-bold'>
                <span className='text-lime-600'>Latest & top</span> Job openings
            </h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5'>
                {allJobs.length === 0 ? (
                    <span>No jobs available</span>
                ) : (
                    allJobs.slice(0, 6).map(job => (
                        <LatestJobCards  key={job._id} job={job} />
                    ))
                )}
            </div>
        </div>
    );
}

export default LatestJobs;