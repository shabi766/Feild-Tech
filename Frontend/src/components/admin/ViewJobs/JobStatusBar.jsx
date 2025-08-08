import React, { useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Briefcase, DollarSign } from 'lucide-react';
import { useSelector } from 'react-redux';

const JobStatusBar = ({ job, status, handlePay, formatDate }) => {
    let checkStatus = null;
    let displayTime = null;
    const checkInTime = job?.checkinTime;
    const checkOutTime = job?.checkoutTime;
    const { singleJob } = useSelector((store) => store.job);

    if (status === "Complete") {
        checkStatus = "Amount Paid";
        displayTime = job?.payableSalary ? `$${job.payableSalary}` : "N/A";
    } else if (checkInTime && checkOutTime) {
        checkStatus = "Checked Out";
        displayTime = formatDate(checkOutTime);
    } else if (checkInTime && (!checkOutTime || checkOutTime === 'null' || checkOutTime === 'undefined')) {
        checkStatus = "Checked In";
        displayTime = formatDate(checkInTime);
    }

    // Use useEffect to log when job changes
    useEffect(() => {
        console.log("Job updated in JobStatusBar:", job);
    }, [job]);

    return (
        <Card className="mb-8">
            <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold text-gray-900">{job?.title || 'Job'}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">ID: {job?._id?.slice(-6) || '---'}</Badge>
                    <Badge className="capitalize">{status || '---'}</Badge>
                    {job?.jobType && (
                        <Badge variant="outline" className="capitalize flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType}</Badge>
                    )}
                    {job?.location?.city && (
                        <Badge variant="outline" className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location.city}</Badge>
                    )}
                    {job?.salary?.partTime?.hourlyRate && (
                        <Badge variant="outline" className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary.partTime.hourlyRate}/hr</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    {checkStatus && (
                        <div className="inline-flex items-center space-x-2 rounded-md bg-green-50 px-3 py-1 text-green-700 border border-green-100">
                            <span className="font-medium">{checkStatus}</span>
                            {displayTime && (
                                <span className="text-xs text-green-600">{displayTime}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="md:text-right space-y-1">
                    {status === "Done" && job?.jobType === "part-time" && job?.partTimeOptions?.base === "hourly" && (
                        <div className="pt-2">
                            <p className="text-sm text-green-600">Payable Salary: {job.payableSalary}</p>
                            <p className="text-sm text-green-600">Payable Hours: {job.payableHours}</p>
                        </div>
                    )}
                    {status === "Done" && (
                        <button
                            onClick={handlePay}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded text-sm"
                        >
                            Pay ${job.payableSalary}
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default JobStatusBar;
