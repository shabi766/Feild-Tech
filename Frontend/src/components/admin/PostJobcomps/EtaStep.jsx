// EtaStep.js
import React from 'react';
import { Label } from '@/components/ui/label';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import DatePicker from 'react-datepicker';

const EtaStep = ({ input, setInput, nextStep, prevStep }) => {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">ETA</h2>
            <div>
                <Label>Start Time</Label>
                <div className="relative flex items-center">
                    <DatePicker selected={input.startTime} onChange={(date) => setInput({ ...input, startTime: date })} showTimeSelect dateFormat="Pp"
                        className="w-full px-3 py-2 border rounded-md" />
                    <FaCalendarAlt className="absolute right-8 text-gray-500" />
                    <FaClock className="absolute right-2 text-gray-500" />
                </div>
            </div>
            <div>
                <Label>End Time</Label>
                <div className="relative flex items-center">
                    <DatePicker selected={input.endTime} onChange={(date) => setInput({ ...input, endTime: date })} showTimeSelect dateFormat="Pp"
                        className="w-full px-3 py-2 border rounded-md" />
                    <FaCalendarAlt className="absolute right-8 text-gray-500" />
                    <FaClock className="absolute right-2 text-gray-500" />
                </div>
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">Back</button>
                <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Continue</button>
            </div>
        </div>
    );
};

export default EtaStep;