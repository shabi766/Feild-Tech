import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SalaryStep = ({ input, setInput }) => {
    // The `jobType` prop is not used directly, as `input.jobType` is already available.
    // This simplifies the props and relies on the state for all decision making.
    const { jobType, partTime } = input;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const handleRateTypeChange = (value) => {
        setInput({ ...input, rateType: value, rate: '' }); // Reset rate when type changes
    };

    const getRateLabel = () => {
        switch (input.rateType) {
            case 'fixed':
                return 'Fixed Rate';
            case 'hourly':
                return 'Hourly Rate';
            case 'daily':
                return 'Daily Rate';
            case 'weekly':
                return 'Weekly Rate';
            case 'contract':
                return jobType === 'part-time' && partTime?.base === 'monthly' ? 'Monthly Rate' : 'Contract Rate';
            default:
                return 'Rate';
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Salary & Compensation
            </h2>
            <p className="text-gray-500 mb-8">
                Specify the rate type and compensation for the job. The options will adapt based on the job's duration.
            </p>

            {/* Rate Type Selection */}
            <div className="space-y-2 mb-6">
                <Label htmlFor="rateType" className="text-sm font-semibold text-gray-700">
                    Rate Type
                </Label>
                <Select id="rateType" onValueChange={handleRateTypeChange} value={input.rateType}>
                    <SelectTrigger className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                        <SelectGroup>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            {jobType === 'part-time' && partTime?.base === 'hourly' && (
                                <SelectItem value="hourly">Hourly</SelectItem>
                            )}
                            {jobType === 'part-time' && partTime?.base === 'daily' && (
                                <SelectItem value="daily">Daily</SelectItem>
                            )}
                            {jobType === 'part-time' && partTime?.base === 'weekly' && (
                                <SelectItem value="weekly">Weekly</SelectItem>
                            )}
                            {jobType === 'part-time' && partTime?.base === 'monthly' && (
                                <SelectItem value="contract">Monthly</SelectItem>
                            )}
                            {jobType === 'full-time' && (
                                <SelectItem value="contract">Contract (for Full-Time)</SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Rate Input Field (Conditional) */}
            {(input.rateType) && (
                <div className="space-y-2">
                    <Label htmlFor="rate" className="text-sm font-semibold text-gray-700">
                        {getRateLabel()}
                    </Label>
                    <Input
                        type="number"
                        id="rate"
                        name="rate"
                        value={input.rate}
                        onChange={handleChange}
                        placeholder="Enter the rate"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )}
        </div>
    );
};

export default SalaryStep;