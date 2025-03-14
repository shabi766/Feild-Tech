import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const JobTypeStep = ({ input, setInput, nextStep, prevStep }) => {
    const handlePartTimeChange = (field, value) => {
        setInput({ ...input, partTime: { ...input.partTime, [field]: value } });
    };

    const handleFullTimeChange = (field, value) => {
        setInput({ ...input, fullTime: { ...input.fullTime, [field]: value } });
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Job Type</h2>
            <div>
                <Label>Job Type</Label>
                <Select onValueChange={(value) => setInput({ ...input, jobType: value })}>
                    <SelectTrigger><SelectValue placeholder="Select Job Type" /></SelectTrigger>
                    <SelectContent><SelectGroup>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                    </SelectGroup></SelectContent>
                </Select>
            </div>
            {input.jobType === 'part-time' && (
                <>
                    <div className="mt-4">
                        <Label>Base Type</Label>
                        <Select onValueChange={(value) => handlePartTimeChange('base', value)}>
                            <SelectTrigger><SelectValue placeholder="Select Part-Time Base" /></SelectTrigger>
                            <SelectContent><SelectGroup>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                            </SelectGroup></SelectContent>
                        </Select>
                    </div>
                    {input.partTime.base === 'hourly' && (
                        <div className="mt-4">
                            <Label>Hourly Hours</Label>
                            <Input
                                type="number"
                                name="hourlyHours"
                                value={input.partTime.hourlyHours}
                                onChange={(e) => handlePartTimeChange('hourlyHours', e.target.value)}
                                placeholder="Enter hours"
                            />
                        </div>
                    )}
                    {input.partTime.base === 'daily' && (
                        <div className="mt-4">
                            <Label>Daily Days</Label>
                            <Input
                                type="number"
                                name="dailyDays"
                                value={input.partTime.dailyDays}
                                onChange={(e) => handlePartTimeChange('dailyDays', e.target.value)}
                                placeholder="Enter days"
                            />
                        </div>
                    )}
                    {input.partTime.base === 'weekly' && (
                        <div className="mt-4">
                            <Label>Weekly Days</Label>
                            <Input
                                type="number"
                                name="weeklyDays"
                                value={input.partTime.weeklyDays}
                                onChange={(e) => handlePartTimeChange('weeklyDays', e.target.value)}
                                placeholder="Enter weeks"
                            />
                        </div>
                    )}
                    {input.partTime.base === 'contract' && (
                        <div className="mt-4">
                            <Label>Contract Months</Label>
                            <Input
                                type="number"
                                name="contractMonths"
                                value={input.partTime.contractMonths}
                                onChange={(e) => handlePartTimeChange('contractMonths', e.target.value)}
                                placeholder="Enter months"
                            />
                        </div>
                    )}
                </>
            )}
            {input.jobType === 'full-time' && (
                <div className="mt-4">
                    <Label>Contract Months</Label>
                    <Input
                        type="number"
                        name="contractMonths"
                        value={input.fullTime.contractMonths}
                        onChange={(e) => handleFullTimeChange('contractMonths', e.target.value)}
                        placeholder="Enter months"
                    />
                </div>
            )}
            <div className="flex justify-between">
                <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">Back</button>
                <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Continue</button>
            </div>
        </div>
    );
};

export default JobTypeStep;