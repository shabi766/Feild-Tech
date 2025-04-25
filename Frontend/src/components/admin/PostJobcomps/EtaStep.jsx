import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EtaStep = ({ input, setInput }) => {
    const [startTime, setStartTime] = useState(input.startTime ? new Date(input.startTime) : new Date());
    const [endTime, setEndTime] = useState(input.endTime ? new Date(input.endTime) : null);

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

    useEffect(() => {
        const calculatedEndTime = calculateEndTime(startTime, input.jobType, input.partTime, input.fullTime);
        if (calculatedEndTime) {
            setEndTime(calculatedEndTime);
        } else {
            setEndTime(null); // Reset end time if calculation fails or dependencies are missing
        }
    }, [startTime, input.jobType, input.partTime, input.fullTime]);

    const handleStartTimeChange = (date) => {
        setStartTime(date);
    };

    const handleEndTimeChange = (date) => {
        setEndTime(date);
    };

    return (
        <div>
           
            <div className="mb-4">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative flex items-center">
                    <DatePicker
                        id="startTime"
                        selected={startTime}
                        onChange={handleStartTimeChange}
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    <FaCalendarAlt className="absolute right-8 text-gray-500" />
                    <FaClock className="absolute right-2 text-gray-500" />
                </div>
            </div>
            <div className="mb-4">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative flex items-center">
                    <DatePicker
                        id="endTime"
                        selected={endTime}
                        onChange={handleEndTimeChange}
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled // Make it read-only based on automatic calculation
                    />
                    <FaCalendarAlt className="absolute right-8 text-gray-500" />
                    <FaClock className="absolute right-2 text-gray-500" />
                </div>
                {endTime && startTime && endTime <= startTime && (
                    <p className="text-red-500 mt-1">End Time must be after Start Time.</p>
                )}
            </div>
        </div>
    );
};

export default EtaStep;