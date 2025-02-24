import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useSelector } from 'react-redux';

const JobTable = () => {
    const { allAppliedJobs } = useSelector((store) => store.job);
    const appliedJobs = Array.isArray(allAppliedJobs) ? allAppliedJobs : [];

    const statusColors = {
        rejected: 'bg-red-400',
        pending: 'bg-gray-400',
        accepted: 'bg-green-400'
    };

    return (
        
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appliedJobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">You haven't applied for any jobs yet.</TableCell>
                        </TableRow>
                    ) : (
                        appliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell>{appliedJob?.Workorder?.title || 'N/A'}</TableCell>
                                <TableCell>{appliedJob?.Workorder?.Company?.name || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Badge className={statusColors[appliedJob?.status] || 'bg-gray-200'}>
                                        {appliedJob.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default JobTable;