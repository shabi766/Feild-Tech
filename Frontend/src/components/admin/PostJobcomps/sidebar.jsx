import React, { useState } from 'react';
import styles from '../PostJobcomps/jobformstepper.module.css'; // Import the CSS module

const JobFormStepper = ({ goToStep, setCustomFieldsEnabled, setAdvancedFieldsEnabled }) => {
    const [customFieldsToggle, setCustomFieldsToggle] = useState(false);
    const [advancedFieldsToggle, setAdvancedFieldsToggle] = useState(false);

    const handleCustomFieldsToggle = () => {
        const newValue = !customFieldsToggle; // Store the new value
        setCustomFieldsToggle(newValue);
        setCustomFieldsEnabled(newValue); // Use the stored value
    };

    const handleAdvancedFieldsToggle = () => {
        const newValue = !advancedFieldsToggle;  // Store the new value
        setAdvancedFieldsToggle(newValue);
        setAdvancedFieldsEnabled(newValue); // Use the stored value
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

    const advancedSteps = [
        { id: 'shipments', label: 'Shipments' },
        { id: 'selection-rule', label: 'Selection Rule' },
        { id: 'smart-audit', label: 'Smart Audit' },
    ];

    return (
        <div className={styles.sidebar}>
            <ul className={styles.navList}>

                {/* Base Steps */}
                {baseSteps.map((step) => (
                    <li
                        key={step.id}
                        className={styles.navItem}
                        onClick={() => goToStep(step.id)}
                    >
                        {step.label}
                    </li>
                ))}

                {/* Custom Fields Toggle */}
                <li className={`${styles.navItem} ${styles.navItemWithToggle}`}>
                    <span>Custom Fields</span>
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={customFieldsToggle}
                            onChange={handleCustomFieldsToggle}
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-6"></div>
                    </label>
                </li>

                {/* Show Custom Fields if enabled */}
                {customFieldsToggle && (
                    <li
                        key={customFieldStep.id}
                        className={styles.navItem}
                        onClick={() => goToStep(customFieldStep.id)}
                    >
                        {customFieldStep.label}
                    </li>
                )}

                {/* Advanced Fields Toggle */}
                <li className={`${styles.navItem} ${styles.navItemWithToggle}`}>
                    <span>Advanced Fields</span>
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={advancedFieldsToggle}
                            onChange={handleAdvancedFieldsToggle}
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-6"></div>
                    </label>
                </li>

                {/* Show Advanced Fields if enabled */}
                {advancedFieldsToggle &&
                    advancedSteps.map((step) => (
                        <li
                            key={step.id}
                            className={styles.navItem}
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
