import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectDetails from '../Hooks/useGetJobbyProject';

import Footer from '../shared/Footer';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { project, jobs, loading, error } = useProjectDetails(projectId);

    if (loading) return <p className="text-center text-xl my-10">Loading project details...</p>;
    if (error) return <p className="text-center text-red-500">Error fetching data.</p>;

    return (
        <div>
            
            <div className="container mx-auto my-10 bg-white p-8 shadow-lg rounded-lg">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Project Details</h1>

                {project ? (
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <div className="mb-6">
                            <h2 className="text-3xl font-semibold text-blue-600 mb-2">{project.name}</h2>
                            <p className="text-gray-700 mb-2"><strong>Description:</strong> {project.description || 'No description available.'}</p>
                            <p className="text-gray-700 mb-2"><strong>Client:</strong> {project.clientName || 'No client associated.'}</p>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-2xl font-semibold text-gray-800">Jobs for this Project</h3>
                            {jobs.length > 0 ? (
                                <table className="min-w-full mt-4 bg-white shadow-md rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                            <th className="py-3 px-6 text-left">Job Title</th>
                                            <th className="py-3 px-6 text-left">Status</th>
                                            <th className="py-3 px-6 text-left">Salary</th>
                                            <th className="py-3 px-6 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                        {jobs.map((job) => (
                                            <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-100">
                                                <td className="py-3 px-6">{job.title}</td>
                                                <td className="py-3 px-6">{job.status}</td>
                                                <td className="py-3 px-6">{job.salary || 'N/A'}</td>
                                                <td className="py-3 px-6">
                                                    <button
                                                        onClick={() => navigate(`/admin/job/detail/${job._id}`)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 mt-4">No jobs found for this project.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-red-500 text-xl">Project not found.</p>
                )}
            </div>
           
            
        </div>
    );
};

export default ProjectDetail;
