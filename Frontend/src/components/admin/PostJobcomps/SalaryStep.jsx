import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const SalaryStep = ({ input, setInput, jobType }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const handleRateTypeChange = (e) => {
        setInput({ ...input, rateType: e.target.value, rate: '' }); // Reset rate when type changes
    };

    return (
        <div>
            

            <div className="mb-4">
                <Label htmlFor="rateType">Rate Type</Label>
                <select
                    id="rateType"
                    name="rateType"
                    value={input.rateType}
                    onChange={handleRateTypeChange}
                    className="w-full px-3 py-2 border rounded-md"
                >
                    <option value="fixed">Fixed</option>
                    {jobType === 'part-time' && input.partTime?.base === 'hourly' && (
                        <option value="hourly">Hourly</option>
                    )}
                    {jobType === 'part-time' && input.partTime?.base === 'daily' && (
                        <option value="daily">Daily</option>
                    )}
                    {jobType === 'part-time' && input.partTime?.base === 'weekly' && (
                        <option value="weekly">Weekly</option>
                    )}
                    {jobType === 'part-time' && input.partTime?.base === 'monthly' && (
                        <option value="contract">Monthly</option>
                    )}
                    {jobType === 'full-time' && (
                        <option value="contract">Contract (for Full-Time)</option>
                    )}
                </select>
            </div>

            {input.rateType === 'fixed' && (
                <div className="mb-4">
                    <Label htmlFor="rate">Fixed Rate</Label>
                    <Input
                        type="number"
                        id="rate"
                        name="rate"
                        value={input.rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            )}

            {input.rateType === 'hourly' && jobType === 'part-time' && input.partTime?.base === 'hourly' && (
                <div className="mb-4">
                    <Label htmlFor="rate">Hourly Rate</Label>
                    <Input
                        type="number"
                        id="rate"
                        name="rate"
                        value={input.rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            )}

            {input.rateType === 'daily' && jobType === 'part-time' && input.partTime?.base === 'daily' && (
                <div className="mb-4">
                    <Label htmlFor="rate">Daily Rate</Label>
                    <Input
                        type="number"
                        id="rate"
                        name="rate"
                        value={input.rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            )}

            {input.rateType === 'weekly' && jobType === 'part-time' && input.partTime?.base === 'weekly' && (
                <div className="mb-4">
                    <Label htmlFor="rate">Weekly Rate</Label>
                    <Input
                        type="number"
                        id="rate"
                        name="rate"
                        value={input.rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            )}

            {input.rateType === 'contract' && (
                <div className="mb-4">
                    <Label htmlFor="rate">
                        {jobType === 'part-time' && input.partTime?.base === 'monthly'
                            ? 'Monthly Rate'
                            : 'Contract Rate'}
                    </Label>
                    <Input
                        type="number"
                        id="rate"
                        name="rate"
                        value={input.rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            )}
        </div>
    );
};

export default SalaryStep;