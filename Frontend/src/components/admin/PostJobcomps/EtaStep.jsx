import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EtaStep = ({ input, setInput, nextStep, prevStep, jobType, partTime, fullTime }) => {

    const calculateEndTime = (startTime, jobType, partTime, fullTime) => {
        if (!startTime || !jobType) return null;

        let endTime = new Date(startTime);

        if (jobType === 'part-time' && partTime) {
            if (partTime.base === 'hourly' && partTime.hourlyHours) {
                endTime.setHours(endTime.getHours() + parseInt(partTime.hourlyHours));
            } else if (partTime.base === 'daily' && partTime.dailyDays) {
                endTime.setDate(endTime.getDate() + parseInt(partTime.dailyDays));
            } else if (partTime.base === 'weekly' && partTime.weeklyDays) {
                endTime.setDate(endTime.getDate() + parseInt(partTime.weeklyDays) * 7);
            } else if (partTime.base === 'contract' && partTime.contractMonths) {
                endTime.setMonth(endTime.getMonth() + parseInt(partTime.contractMonths));
            }
        } else if (jobType === 'full-time' && fullTime) {
            if (fullTime.base === 'contract' && fullTime.contractMonths) {
                endTime.setMonth(endTime.getMonth() + parseInt(fullTime.contractMonths));
            }
        }

        return endTime;
    };

    const handleStartTimeChange = (date) => {
        setInput({ ...input, startTime: date });
    };

    useEffect(() => {
        const endTime = calculateEndTime(input.startTime, jobType, partTime, fullTime);
        if (endTime) {
            setInput({ ...input, endTime: endTime });
        }
    }, [input.startTime, jobType, partTime, fullTime, setInput])

    const handleEndTimeChange = (date) => {
        setInput({ ...input, endTime: date });
    };

    const handleNext = () => {
        if (input.endTime && input.startTime && input.endTime <= input.startTime) {
            alert("End Time must be after Start Time.");
            return;
        }
        nextStep();
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-4">ETA</h2>
            <div className="mb-4">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative flex items-center">
                    <DatePicker
                        id="startTime"
                        selected={input.startTime}
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
                        selected={input.endTime}
                        onChange={handleEndTimeChange}
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    <FaCalendarAlt className="absolute right-8 text-gray-500" />
                    <FaClock className="absolute right-2 text-gray-500" />
                </div>
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">
                    Back
                </button>
                <button onClick={handleNext} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">
                    Continue
                </button>
            </div>
        </div>
    );
};

export default EtaStep;