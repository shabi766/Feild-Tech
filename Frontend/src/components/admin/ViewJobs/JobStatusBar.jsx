// JobStatusBar.jsx
import React from 'react';

const JobStatusBar = ({ job, status, handlePay, formatDate }) => {
    let checkStatus = null;
    let displayTime = null;
    const checkInTime = job?.checkinTime;
    const checkOutTime = job?.checkoutTime;

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

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-100 p-4 mb-6 rounded-lg shadow-md">
            <div>
                <h2 className="text-lg font-semibold">Job ID: {job?._id?.slice(-6) || "---"}</h2>
                <p>Status: <span className="font-bold">{status}</span></p>
                {checkStatus && (
                    <div className="mt-2">
                        <div className={`font-semibold bg-green-200 p-1 rounded`}>
                            {checkStatus}
                            {displayTime && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {displayTime}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="md:text-right mt-2 md:mt-0">
                <h2 className="text-lg font-semibold text-blue-600">Salary: {job?.totalSalary || "---"}</h2>
                <p className="text-sm text-gray-500">Duration: {job?.totalJobDuration || "---"}</p>
                {status === "Done" && job?.jobType === "part-time" && job?.partTimeOptions?.base === "hourly" && (
                    <>
                        <p className="text-sm text-green-500">
                            Payable Salary: {job.payableSalary}
                        </p>
                        <p className="text-sm text-green-500">
                            Payable Hours: {job.payableHours}
                        </p>
                    </>
                )}
                {status === "Done" && (
                    <button
                        onClick={handlePay}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                        Pay ${job.payableSalary}
                    </button>
                )}
            </div>
        </div>
    );
};

export default JobStatusBar;