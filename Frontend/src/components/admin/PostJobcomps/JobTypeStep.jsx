// JobTypeStep.js
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const JobTypeStep = ({ input, setInput, nextStep, prevStep }) => {
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
                        <Select onValueChange={(value) => setInput({ ...input, partTime: { ...input.partTime, base: value } })}>
                            <SelectTrigger><SelectValue placeholder="Select Part-Time Base" /></SelectTrigger>
                            <SelectContent><SelectGroup>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                            </SelectGroup></SelectContent>
                        </Select>
                    </div>
                    {/* Conditionally render part-time options */}
                    {input.partTime.base === 'hourly' && (
                        <div className="mt-4"><Label>Hourly Hours</Label><Input type="number" name="hourlyHours" value={input.partTime.hourlyHours} onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, hourlyHours: e.target.value } })} placeholder="Enter hours" /></div>
                    )}
                    {input.partTime.base === 'daily' && (
                        <div className="mt-4"><Label>Daily Days</Label><Input type="number" name="dailyDays" value={input.partTime.dailyDays} onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, dailyDays: e.target.value } })} placeholder="Enter days" /></div>
                    )}
                    {input.partTime.base === 'weekly' && (
                        <div className="mt-4"><Label>Weekly Days</Label><Input type="number" name="weeklyDays" value={input.partTime.weeklyDays} onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, weeklyDays: e.target.value } })} placeholder="Enter weeks" /></div>
                    )}
                    {input.partTime.base === 'contract' && (
                        <div className="mt-4"><Label>Contract Months</Label><Input type="number" name="contractMonths" value={input.partTime.contractMonths} onChange={(e) => setInput({ ...input, partTime: { ...input.partTime, contractMonths: e.target.value } })} placeholder="Enter months" /></div>
                    )}
                </>
            )}
            {input.jobType === 'full-time' && (
                <div className="mt-4"><Label>Contract Months</Label><Input type="number" name="contractMonths" value={input.fullTime.contractMonths} onChange={(e) => setInput({ ...input, fullTime: { ...input.fullTime, contractMonths: e.target.value } })} placeholder="Enter months" /></div>
            )}
            <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Continue</button>
        </div>
    );
};

export default JobTypeStep;