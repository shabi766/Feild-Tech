import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Lock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

const EtaStep = ({ input, setInput }) => {
    const [startTime, setStartTime] = useState(input.startTime ? new Date(input.startTime) : new Date());
    const [endTime, setEndTime] = useState(input.endTime ? new Date(input.endTime) : null);

    // This effect ensures the parent state is always in sync with the local state
    useEffect(() => {
        setInput(prevInput => ({ ...prevInput, startTime }));
    }, [startTime, setInput]);

    useEffect(() => {
        setInput(prevInput => ({ ...prevInput, endTime }));
    }, [endTime, setInput]);

    const calculateEndTime = (start, jobType, partTime, fullTime) => {
        if (!start || !jobType) return null;

        let calculatedEndTime = new Date(start);

        if (jobType === 'part-time' && partTime) {
            if (partTime.base === 'hourly' && partTime.hourlyHours) {
                calculatedEndTime.setHours(calculatedEndTime.getHours() + parseInt(partTime.hourlyHours));
            } else if (partTime.base === 'daily' && partTime.dailyDays) {
                calculatedEndTime.setDate(calculatedEndTime.getDate() + parseInt(partTime.dailyDays));
            } else if (partTime.base === 'weekly' && partTime.weeklyDays) {
                calculatedEndTime.setDate(calculatedEndTime.getDate() + parseInt(partTime.weeklyDays) * 7);
            } else if (partTime.base === 'monthly' && partTime.monthlyMonths) {
                calculatedEndTime.setMonth(calculatedEndTime.getMonth() + parseInt(partTime.monthlyMonths));
            }
        } else if (jobType === 'full-time' && fullTime) {
            if (fullTime.contractMonths) {
                calculatedEndTime.setMonth(calculatedEndTime.getMonth() + parseInt(fullTime.contractMonths));
            }
        }

        return calculatedEndTime;
    };

    // This effect handles the automatic calculation of the end time
    useEffect(() => {
        const calculatedEndTime = calculateEndTime(startTime, input.jobType, input.partTime, input.fullTime);
        if (calculatedEndTime) {
            setEndTime(calculatedEndTime);
        } else {
            setEndTime(null);
        }
    }, [startTime, input.jobType, input.partTime, input.fullTime, setEndTime]);

    const handleStartTimeChange = (date) => {
        setStartTime(date);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Estimated Time
            </h2>
            <p className="text-gray-500 mb-8">
                Set the start time for the job. The end time will be automatically calculated based on the job type.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Start Time Section */}
                <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700">
                        Start Time
                    </Label>
                    <div className="relative">
                        <DatePicker
                            id="startTime"
                            selected={startTime}
                            onChange={handleStartTimeChange}
                            showTimeSelect
                            dateFormat="Pp"
                            className="w-full rounded-lg bg-white border border-gray-300 shadow-sm px-4 py-2 pl-10 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                </div>

                {/* End Time Section (Read-only) */}
                <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm font-semibold text-gray-700">
                        End Time
                    </Label>
                    <div className="relative">
                        <DatePicker
                            id="endTime"
                            selected={endTime}
                            showTimeSelect
                            dateFormat="Pp"
                            className={cn(
                                "w-full rounded-lg bg-gray-100 border border-gray-300 shadow-sm px-4 py-2 pl-10 cursor-not-allowed",
                                !endTime && "text-gray-400"
                            )}
                            disabled
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                    {endTime && startTime && endTime <= startTime && (
                        <p className="text-red-500 text-sm mt-1">End Time must be after Start Time.</p>
                    )}
                    {!endTime && (
                         <p className="text-gray-500 text-sm mt-1">End time will be calculated automatically.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EtaStep;