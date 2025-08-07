import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const SelectionRules = ({ initialRules = {}, onChange }) => {
    const [rules, setRules] = useState(initialRules);

    useEffect(() => {
        // Check if onChange is a function before calling it
        if (typeof onChange === 'function') {
            onChange(rules);
        }
    }, [rules, onChange]);

    const handleInputChange = useCallback((name, value) => {
        setRules(prevRules => ({ ...prevRules, [name]: value }));
    }, []);

    const handleCheckboxChange = useCallback((name, checked) => {
        setRules(prevRules => ({ ...prevRules, [name]: checked }));
    }, []);

    const handleArrayInputChange = useCallback((name, value) => {
        const values = value.split(',').map(item => item.trim()).filter(Boolean);
        setRules(prevRules => ({ ...prevRules, [name]: values }));
    }, []);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Selection Rules
            </h2>
            <p className="text-gray-500 mb-8">
                Define the requirements and criteria for this job. Candidates who meet these rules will be automatically flagged as a match.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Required Skills */}
                <div className="space-y-2">
                    <Label htmlFor="requiredSkills" className="text-sm font-semibold text-gray-700">
                        Required Skills
                        <span className="text-gray-400 font-normal italic"> (comma-separated)</span>
                    </Label>
                    <Input
                        type="text"
                        id="requiredSkills"
                        name="requiredSkills"
                        value={rules.requiredSkills ? rules.requiredSkills.join(', ') : ''}
                        onChange={(e) => handleArrayInputChange('requiredSkills', e.target.value)}
                        placeholder="e.g., JavaScript, React, Node.js"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Required Degrees */}
                <div className="space-y-2">
                    <Label htmlFor="requiredDegrees" className="text-sm font-semibold text-gray-700">
                        Required Degrees
                        <span className="text-gray-400 font-normal italic"> (comma-separated)</span>
                    </Label>
                    <Input
                        type="text"
                        id="requiredDegrees"
                        name="requiredDegrees"
                        value={rules.requiredDegrees ? rules.requiredDegrees.join(', ') : ''}
                        onChange={(e) => handleArrayInputChange('requiredDegrees', e.target.value)}
                        placeholder="e.g., Bachelor of Science, MBA"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Required Certifications */}
                <div className="space-y-2">
                    <Label htmlFor="requiredCertifications" className="text-sm font-semibold text-gray-700">
                        Required Certifications
                        <span className="text-gray-400 font-normal italic"> (comma-separated)</span>
                    </Label>
                    <Input
                        type="text"
                        id="requiredCertifications"
                        name="requiredCertifications"
                        value={rules.requiredCertifications ? rules.requiredCertifications.join(', ') : ''}
                        onChange={(e) => handleArrayInputChange('requiredCertifications', e.target.value)}
                        placeholder="e.g., PMP, AWS Certified"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Required Tools */}
                <div className="space-y-2">
                    <Label htmlFor="requiredTools" className="text-sm font-semibold text-gray-700">
                        Required Tools
                        <span className="text-gray-400 font-normal italic"> (comma-separated)</span>
                    </Label>
                    <Input
                        type="text"
                        id="requiredTools"
                        name="requiredTools"
                        value={rules.requiredTools ? rules.requiredTools.join(', ') : ''}
                        onChange={(e) => handleArrayInputChange('requiredTools', e.target.value)}
                        placeholder="e.g., Figma, Adobe Photoshop"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Minimum Experience */}
                <div className="space-y-2">
                    <Label htmlFor="minimumExperience" className="text-sm font-semibold text-gray-700">
                        Minimum Experience
                        <span className="text-gray-400 font-normal italic"> (in years)</span>
                    </Label>
                    <Input
                        type="number"
                        id="minimumExperience"
                        name="minimumExperience"
                        value={rules.minimumExperience || ''}
                        onChange={(e) => handleInputChange('minimumExperience', e.target.value)}
                        placeholder="e.g., 5"
                        className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Must Have Portfolio */}
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="mustHavePortfolio"
                        name="mustHavePortfolio"
                        checked={rules.mustHavePortfolio || false}
                        onCheckedChange={(checked) => handleCheckboxChange('mustHavePortfolio', checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="mustHavePortfolio" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Must have a portfolio
                    </Label>
                </div>
            </div>
        </div>
    );
};

export default SelectionRules;