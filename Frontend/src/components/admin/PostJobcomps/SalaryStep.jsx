// SalaryStep.js
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SalaryStep = ({ input, setInput, nextStep, prevStep }) => {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Salary</h2>
            <div className="mt-4">
                <Label>Rate Type</Label>
                <Select onValueChange={(value) => setInput({ ...input, rateType: value })}>
                    <SelectTrigger><SelectValue placeholder="Select Rate Type" /></SelectTrigger>
                    <SelectContent><SelectGroup>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="hourly">Per Hour</SelectItem>
                    </SelectGroup></SelectContent>
                </Select>
            </div>
            <div className="mt-4">
                <Label>Rate</Label>
                <Input type="number" name="rate" value={input.rate} onChange={(e) => setInput({ ...input, rate: e.target.value })}
                    placeholder={`Enter ${input.rateType === 'hourly' ? 'hourly' : 'fixed'} rate`} />
            </div>
            <div className="mt-4">
                <Label>Calculated Salary</Label>
                <Input type="number" name="TotalSalary" value={input.calculatedSalary} readOnly className="my-2" />
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">Back</button>
                <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Continue</button>
            </div>
        </div>
    );
};

export default SalaryStep;