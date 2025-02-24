import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProjectTable = () => {
    const { projects = [], searchProjectByText } = useSelector(store => store.project || {});
    const [filterProject, setFilterProject] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const filteredProject = projects.filter((project) => {
            if (!searchProjectByText) return true;
            return project?.name?.toLowerCase().includes(searchProjectByText.toLowerCase());
        });
        setFilterProject(filteredProject);
    }, [projects, searchProjectByText]);

    const handleRowClick = (projectId) => {
        navigate(`/admin/project/detail/${projectId}`);
    };

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <Table className="rounded-lg overflow-hidden border border-gray-200">
                <TableCaption className="font-semibold text-lg py-4">Recent Registered Projects</TableCaption>
                <TableHeader className="bg-gray-100">
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterProject.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500">No Projects to show</TableCell>
                        </TableRow>
                    ) : (
                        filterProject.map((project) => (
                            <TableRow
                                key={project._id}
                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => handleRowClick(project._id)}
                            >
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={project.logo || "https://via.placeholder.com/200"} alt={`${project.name} Logo`} />
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium text-blue-600">{project.name}</TableCell>
                                <TableCell>{project?.client?.name || 'No Client'}</TableCell>
                                <TableCell>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell className="text-right cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                    <Popover>
                                        <PopoverTrigger>
                                            <span className="cursor-pointer text-gray-500 hover:text-gray-700">
                                                <MoreHorizontal />
                                            </span>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/projects/${project._id}`);
                                                }}
                                                className='flex items-center gap-2 w-fit cursor-pointer p-2 hover:bg-gray-100 rounded-md'
                                                aria-label={`Edit ${project.name}`}
                                            >
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProjectTable;
