// JobDetails.jsx
import React from 'react';

const JobDetails = ({ job, clientName, projectName, jobType, formatDate }) => {
    return (
        <div className="bg-white p-8 shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl">
            {job ? (
                <>
                    <section className="my-4">
                        <h3 className="text-xl font-semibold text-gray-800">Title</h3>
                        <p className="text-gray-700">{job?.title || "---"}</p>
                    </section>
                    <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Job Description</h3>
                                <p className="text-gray-700">{job?.description || "---"}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Client</h3>
                                <p className="text-gray-700">{clientName}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Project</h3>
                                <p className="text-gray-700">{projectName}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Job Type</h3>
                                <p className="text-gray-700">{jobType}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">ETA Start Time</h3>
                                <p className="text-gray-700">{formatDate(job?.startTime)}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">ETA End Time</h3>
                                <p className="text-gray-700">{formatDate(job?.endTime)}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Address</h3>
                                <p className="text-gray-700">{job?.location?.street || '---'}</p>
                            </section>
                            <section className="my-4">
                                <h3 className="text-xl font-semibold text-gray-800">Skills</h3>
                                <p className="text-gray-700">{job?.skills?.join(', ') || '---'}</p>
                            </section>
                    
                    <section className="my-4">
                        <h3 className="text-xl font-semibold text-gray-800">Required Tools</h3>
                        <p className="text-gray-700">{job?.requiredTools?.join(', ') || '---'}</p>
                    </section>
                </>
            ) : (
                <p className="text-center text-gray-600">No job details available.</p>
            )}
        </div>
    );
};

export default JobDetails;