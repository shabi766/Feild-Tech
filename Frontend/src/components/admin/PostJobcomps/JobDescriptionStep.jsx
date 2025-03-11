// JobDescriptionStep.js
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const JobDescriptionStep = ({ input, setInput, nextStep, prevStep }) => {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Job Description</h2>
            <div>
                <Label>Description</Label>
                <textarea name="description" value={input.description} onChange={(e) => setInput({ ...input, description: e.target.value })}
                    className="my-2 w-full border rounded-md resize-none" rows={4} />
            </div>
            <div>
                <Label>Required Tools</Label>
                <Input type="text" name="requiredTools" value={input.requiredTools} onChange={(e) => setInput({ ...input, requiredTools: e.target.value })}
                    placeholder="Comma-separated" className="my-2" />
            </div>
            <div>
                <Label>Skills</Label>
                <Input type="text" name="skills" value={input.skills} onChange={(e) => setInput({ ...input, skills: e.target.value })}
                    placeholder="Comma-separated" className="my-2" />
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md">Back</button>
                <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Continue</button>
            </div>
        </div>
    );
};

export default JobDescriptionStep;