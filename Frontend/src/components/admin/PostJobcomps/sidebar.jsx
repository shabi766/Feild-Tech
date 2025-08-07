import React, { useState } from 'react';

const JobFormStepper = ({ goToStep, setCustomFieldsEnabled, setAdvancedFieldsEnabled }) => {
    const [customFieldsToggle, setCustomFieldsToggle] = useState(false);
    const [advancedFieldsToggle, setAdvancedFieldsToggle] = useState(false);

    const handleCustomFieldsToggle = () => {
        const newValue = !customFieldsToggle;
        setCustomFieldsToggle(newValue);
        setCustomFieldsEnabled(newValue);
    };

    const handleAdvancedFieldsToggle = () => {
        const newValue = !advancedFieldsToggle;
        setAdvancedFieldsToggle(newValue);
        setAdvancedFieldsEnabled(newValue);
    };

    const baseSteps = [
        { id: 'job-details', label: 'Title' },
        { id: 'job-description', label: 'Job Description' },
        { id: 'job-type', label: 'Job Type' },
        { id: 'salary-details', label: 'Salary/PayRates' },
        { id: 'eta', label: 'ETA' },
        { id: 'address', label: 'Address' },
        { id: 'contacts', label: 'Contacts' },
        { id: 'attachments', label: 'Attachments' },
    ];

    const customFieldStep = { id: 'custom-fields', label: 'Custom Fields' };
    const taskListStep = { id: 'job-tasks', label: 'TaskList' };

    const advancedSteps = [
        { id: 'shipments', label: 'Shipments' },
        { id: 'selection-rule', label: 'Selection Rule' },
        { id: 'smart-audit', label: 'Smart Audit' },
    ];

    return (
        <div className="w-[300px] bg-white rounded-xl shadow-lg p-6 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Form Steps</h3>
            <ul className="space-y-2">
                {/* Base Steps */}
                {baseSteps.map((step) => (
                    <li
                        key={step.id}
                        className="py-2 px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                        onClick={() => goToStep(step.id)}
                    >
                        {step.label}
                    </li>
                ))}

                {/* Custom Fields Toggle */}
                <li className="py-2 px-4 flex items-center justify-between space-x-2 border-t mt-4 pt-4">
                    <span className="font-medium text-gray-700">Custom Fields</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={customFieldsToggle}
                            onChange={handleCustomFieldsToggle}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </li>

                {/* Show Custom Fields and TaskList if enabled */}
                {customFieldsToggle && (
                    <>
                        <li
                            key={customFieldStep.id}
                            className="py-2 px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                            onClick={() => goToStep(customFieldStep.id)}
                        >
                            {customFieldStep.label}
                        </li>
                        <li
                            key={taskListStep.id}
                            className="py-2 px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                            onClick={() => goToStep(taskListStep.id)}
                        >
                            {taskListStep.label}
                        </li>
                    </>
                )}

                {/* Advanced Fields Toggle */}
                <li className="py-2 px-4 flex items-center justify-between space-x-2 border-t mt-4 pt-4">
                    <span className="font-medium text-gray-700">Advanced Fields</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={advancedFieldsToggle}
                            onChange={handleAdvancedFieldsToggle}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </li>

                {/* Show Advanced Fields if enabled */}
                {advancedFieldsToggle &&
                    advancedSteps.map((step) => (
                        <li
                            key={step.id}
                            className="py-2 px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                            onClick={() => goToStep(step.id)}
                        >
                            {step.label}
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default JobFormStepper;