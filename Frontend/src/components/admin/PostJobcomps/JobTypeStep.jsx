import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const JobTypeStep = ({ input, setInput }) => {
    const [localPartTime, setLocalPartTime] = useState(input.partTime || { base: '', hourlyHours: '', dailyDays: '', weeklyDays: '', monthlyMonths: '' });
    const [localFullTime, setLocalFullTime] = useState(input.fullTime || { contractMonths: '' });

    // Sync local state with parent state on changes
    useEffect(() => {
        setInput(prevInput => ({
            ...prevInput,
            partTime: localPartTime,
            fullTime: localFullTime,
        }));
    }, [localPartTime, localFullTime, setInput]);

    // Handlers for logic
    const handleJobTypeChange = (value) => {
        setInput(prevInput => ({
            ...prevInput,
            jobType: value,
            partTime: { base: '', hourlyHours: '', dailyDays: '', weeklyDays: '', monthlyMonths: '' },
            fullTime: { contractMonths: '' },
            rateType: 'fixed',
            rate: '',
        }));
    };

    const handlePartTimeBaseChange = (value) => {
        setLocalPartTime(prev => ({
            ...prev,
            base: value,
            hourlyHours: '', dailyDays: '', weeklyDays: '', monthlyMonths: '',
        }));
        setInput(prevInput => ({
            ...prevInput,
            rateType: 'fixed',
            rate: '',
        }));
    };

    const handlePartTimeInputChange = (field, value) => {
        setLocalPartTime(prev => ({ ...prev, [field]: value }));
    };

    const handleFullTimeInputChange = (field, value) => {
        setLocalFullTime(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Job Type & Duration
            </h2>
            <p className="text-gray-500 mb-8">
                Specify the type of job and its duration. This information is used to calculate the estimated end time.
            </p>

            {/* Job Type Section */}
            <div className="mb-6 space-y-2">
                <Label htmlFor="jobTypeSelect" className="text-sm font-semibold text-gray-700">Job Type</Label>
                <Select id="jobTypeSelect" onValueChange={handleJobTypeChange} value={input.jobType}>
                    <SelectTrigger className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select Job Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                        <SelectGroup>
                            <SelectItem value="part-time">Part-Time</SelectItem>
                            <SelectItem value="full-time">Full-Time</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Conditional Part-Time Fields */}
            {input.jobType === 'part-time' && (
                <>
                    <div className="mb-6 space-y-2">
                        <Label htmlFor="partTimeBaseSelect" className="text-sm font-semibold text-gray-700">Part-Time Base</Label>
                        <Select id="partTimeBaseSelect" onValueChange={handlePartTimeBaseChange} value={localPartTime.base}>
                            <SelectTrigger className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Select Base Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectGroup>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {localPartTime.base === 'hourly' && (
                        <div className="space-y-2">
                            <Label htmlFor="hourlyHoursInput" className="text-sm font-semibold text-gray-700">Hourly Hours</Label>
                            <Input
                                type="number"
                                id="hourlyHoursInput"
                                name="hourlyHours"
                                value={localPartTime.hourlyHours}
                                onChange={(e) => handlePartTimeInputChange('hourlyHours', e.target.value)}
                                placeholder="Enter total hours for the job"
                                className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                    {localPartTime.base === 'daily' && (
                        <div className="space-y-2">
                            <Label htmlFor="dailyDaysInput" className="text-sm font-semibold text-gray-700">Number of Days</Label>
                            <Input
                                type="number"
                                id="dailyDaysInput"
                                name="dailyDays"
                                value={localPartTime.dailyDays}
                                onChange={(e) => handlePartTimeInputChange('dailyDays', e.target.value)}
                                placeholder="Enter number of days"
                                className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                    {localPartTime.base === 'weekly' && (
                        <div className="space-y-2">
                            <Label htmlFor="weeklyDaysInput" className="text-sm font-semibold text-gray-700">Number of Weeks</Label>
                            <Input
                                type="number"
                                id="weeklyDaysInput"
                                name="weeklyDays"
                                value={localPartTime.weeklyDays}
                                onChange={(e) => handlePartTimeInputChange('weeklyDays', e.target.value)}
                                placeholder="Enter number of weeks"
                                className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                    {localPartTime.base === 'monthly' && (
                        <div className="space-y-2">
                            <Label htmlFor="monthlyMonthsInput" className="text-sm font-semibold text-gray-700">Number of Months</Label>
                            <Input
                                type="number"
                                id="monthlyMonthsInput"
                                name="monthlyMonths"
                                value={localPartTime.monthlyMonths}
                                onChange={(e) => handlePartTimeInputChange('monthlyMonths', e.target.value)}
                                placeholder="Enter number of months"
                                className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                </>
            )}

            {/* Conditional Full-Time Fields */}
            {input.jobType === 'full-time' && (
                <div className="space-y-2 mt-6">
                    <Label htmlFor="contractMonthsInput" className="text-sm font-semibold text-gray-700">Contract Months</Label>
                    <Input
                        type="number"
                        id="contractMonthsInput"
                        name="contractMonths"
                        value={localFullTime.contractMonths}
                        onChange={(e) => handleFullTimeInputChange('contractMonths', e.target.value)}
                        placeholder="Enter total months for the contract"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )}
        </div>
    );
};

export default JobTypeStep;