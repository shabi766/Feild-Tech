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
                <Label>Confidential Description (optional)</Label>
                <textarea name="description" value={input.confidential} onChange={(e) => setInput({ ...input, confidential: e.target.value })}
                    className="my-2 w-full border rounded-md resize-none" rows={4} />
            </div>

            <div>
                <Label>Required Tools</Label>
                <Input type="text" name="requiredTools" value={input.requiredTools} onChange={(e) => setInput({ ...input, requiredTools: e.target.value })}
                    placeholder="add multiple tools by separtaing using comas" className="my-2 w-[500px]" />
            </div>
            <div>
                <Label>Skills</Label>
                <Input type="text" name="skills" value={input.skills} onChange={(e) => setInput({ ...input, skills: e.target.value })}
                    placeholder="add multiple tools by separtaing using comas" className="my-2 w-[500px]" />
            </div>
            
        </div>
    );
};

export default JobDescriptionStep;