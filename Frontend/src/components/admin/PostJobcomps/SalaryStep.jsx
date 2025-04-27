import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const SalaryStep = ({ input, setInput, jobType }) => {
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleRateTypeChange = (e) => {
    setInput({ ...input, rateType: e.target.value, rate: '' }); // Reset rate when type changes
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Label htmlFor="rateType" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'rateType' ? 'text-indigo-500' : ''}`}>
          Rate Type
        </Label>
        <select
          id="rateType"
          name="rateType"
          value={input.rateType}
          onChange={handleRateTypeChange}
          className={`mt-1 block w-[400px] px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'rateType' ? 'border-indigo-500' : ''}`}
          onFocus={() => setFocusedInput('rateType')}
          onBlur={() => setFocusedInput(null)}
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
        {focusedInput === 'rateType' && (
          <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
        )}
      </div>

      {input.rateType === 'fixed' && (
        <div className="relative">
          <Label htmlFor="rate" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'rate' ? 'text-indigo-500' : ''}`}>
            Fixed Rate
          </Label>
          <Input
            type="number"
            id="rate"
            name="rate"
            value={input.rate}
            onChange={handleChange}
            className={`mt-1 w-[400px] px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'rate' ? 'border-indigo-500' : ''}`}
            onFocus={() => setFocusedInput('rate')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'rate' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
      )}

      {input.rateType === 'hourly' && jobType === 'part-time' && input.partTime?.base === 'hourly' && (
        <div className="relative">
          <Label htmlFor="rate" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'rate' ? 'text-indigo-500' : ''}`}>
            Hourly Rate
          </Label>
          <Input
            type="number"
            id="rate"
            name="rate"
            value={input.rate}
            onChange={handleChange}
            className={`mt-1 w-[400px] px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'rate' ? 'border-indigo-500' : ''}`}
            onFocus={() => setFocusedInput('rate')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'rate' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
      )}

      {input.rateType === 'daily' && jobType === 'part-time' && input.partTime?.base === 'daily' && (
        <div className="relative">
          <Label htmlFor="rate" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'rate' ? 'text-indigo-500' : ''}`}>
            Daily Rate
          </Label>
          <Input
            type="number"
            id="rate"
            name="rate"
            value={input.rate}
            onChange={handleChange}
            className={`mt-1 w-[400px] px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'rate' ? 'border-indigo-500' : ''}`}
            onFocus={() => setFocusedInput('rate')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'rate' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
      )}

      {input.rateType === 'weekly' && jobType === 'part-time' && input.partTime?.base === 'weekly' && (
        <div className="relative">
          <Label htmlFor="rate" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'rate' ? 'text-indigo-500' : ''}`}>
            Weekly Rate
          </Label>
          <Input
            type="number"
            id="rate"
            name="rate"
            value={input.rate}
            onChange={handleChange}
            className={`mt-1 w-[400px] px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'rate' ? 'border-indigo-500' : ''}`}
            onFocus={() => setFocusedInput('rate')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'rate' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
      )}

      {input.rateType === 'contract' && (
        <div className="relative">
          <Label htmlFor="rate" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'rate' ? 'text-indigo-500' : ''}`}>
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
            className={`mt-1 w-[400px] px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'rate' ? 'border-indigo-500' : ''}`}
            onFocus={() => setFocusedInput('rate')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'rate' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryStep;