import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const JobTypeStep = ({ input, setInput }) => {
    const [localPartTime, setLocalPartTime] = useState(input.partTime || { base: '', hourlyHours: '', dailyDays: '', weeklyDays: '', monthlyMonths: '' });
    const [localFullTime, setLocalFullTime] = useState(input.fullTime || { contractMonths: '' });

    useEffect(() => {
        setInput(prevInput => ({
            ...prevInput,
            partTime: localPartTime,
            fullTime: localFullTime,
        }));
    }, [localPartTime, localFullTime, setInput]);

    const handleJobTypeChange = (value) => {
        setInput(prevInput => ({
            ...prevInput,
            jobType: value,
            partTime: { base: '', hourlyHours: '', dailyDays: '', weeklyDays: '', monthlyMonths: '' },
            fullTime: { contractMonths: '' },
            rateType: 'fixed', // Reset rate type
            rate: '', // Reset rate
        }));
    };

    const handlePartTimeBaseChange = (value) => {
        setLocalPartTime(prev => ({
            ...prev,
            base: value,
            hourlyHours: '',
            dailyDays: '',
            weeklyDays: '',
            monthlyMonths: '',
        }));
        setInput(prevInput => ({
            ...prevInput,
            rateType: 'fixed', // Reset rate type when base changes
            rate: '', // Reset rate
        }));
    };

    const handlePartTimeInputChange = (field, value) => {
        setLocalPartTime(prev => ({ ...prev, [field]: value }));
    };

    const handleFullTimeInputChange = (field, value) => {
        setLocalFullTime(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            
            <div className="mb-4">
                <Label htmlFor="jobTypeSelect" className="block mb-2">Job Type</Label>
                <Select id="jobTypeSelect" onValueChange={handleJobTypeChange} value={input.jobType}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="part-time">Part-Time</SelectItem>
                            <SelectItem value="full-time">Full-Time</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {input.jobType === 'part-time' && (
                <>
                    <div className="mb-4">
                        <Label htmlFor="partTimeBaseSelect" className="block mb-2">Base Type</Label>
                        <Select id="partTimeBaseSelect" onValueChange={handlePartTimeBaseChange} value={localPartTime.base}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Part-Time Base" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <div className="mb-4">
                            <Label htmlFor="hourlyHoursInput" className="block mb-2">Hourly Hours</Label>
                            <Input
                                type="number"
                                id="hourlyHoursInput"
                                name="hourlyHours"
                                value={localPartTime.hourlyHours}
                                onChange={(e) => handlePartTimeInputChange('hourlyHours', e.target.value)}
                                placeholder="Enter hours"
                            />
                        </div>
                    )}
                    {localPartTime.base === 'daily' && (
                        <div className="mb-4">
                            <Label htmlFor="dailyDaysInput" className="block mb-2">Daily Days</Label>
                            <Input
                                type="number"
                                id="dailyDaysInput"
                                name="dailyDays"
                                value={localPartTime.dailyDays}
                                onChange={(e) => handlePartTimeInputChange('dailyDays', e.target.value)}
                                placeholder="Enter days"
                            />
                        </div>
                    )}
                    {localPartTime.base === 'weekly' && (
                        <div className="mb-4">
                            <Label htmlFor="weeklyDaysInput" className="block mb-2">Weekly Days</Label>
                            <Input
                                type="number"
                                id="weeklyDaysInput"
                                name="weeklyDays"
                                value={localPartTime.weeklyDays}
                                onChange={(e) => handlePartTimeInputChange('weeklyDays', e.target.value)}
                                placeholder="Enter weeks"
                            />
                        </div>
                    )}
                    {localPartTime.base === 'monthly' && (
                        <div className="mb-4">
                            <Label htmlFor="monthlyMonthsInput" className="block mb-2">Monthly Months</Label>
                            <Input
                                type="number"
                                id="monthlyMonthsInput"
                                name="monthlyMonths"
                                value={localPartTime.monthlyMonths}
                                onChange={(e) => handlePartTimeInputChange('monthlyMonths', e.target.value)}
                                placeholder="Enter months"
                            />
                        </div>
                    )}
                </>
            )}

            {input.jobType === 'full-time' && (
                <div className="mt-4">
                    <Label htmlFor="contractMonthsInput" className="block mb-2">Contract Months</Label>
                    <Input
                        type="number"
                        id="contractMonthsInput"
                        name="contractMonths"
                        value={localFullTime.contractMonths}
                        onChange={(e) => handleFullTimeInputChange('contractMonths', e.target.value)}
                        placeholder="Enter months"
                    />
                </div>
            )}
        </div>
    );
};

export default JobTypeStep;