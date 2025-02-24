// src/components/JobFormStepper.jsx
import React from 'react';

const JobFormStepper = ({ currentStep, goToStep }) => {
    const steps = [
        { id: 1, label: 'Title' },
        { id: 2, label: 'Job Description' },
        { id: 3, label: 'Job Type' },
        { id: 4, label: 'Salary/PayRates'},
        { id: 5, label: 'ETA' },
        { id: 6, label: 'Address' },
    ];

    return (
        <div className="w-1/4 bg-gray-100 h-full p-4 shadow-md">
            <ul className="space-y-4">
                {steps.map((step, index) => (
                    <li
                        key={step.id}
                        className={`font-bold p-2 rounded cursor-pointer ${currentStep === step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => goToStep(step.id)} // Allow navigation to a specific step
                    >
                        {step.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JobFormStepper;
