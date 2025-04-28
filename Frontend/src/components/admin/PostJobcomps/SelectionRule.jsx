import React, { useState, useCallback } from 'react';
import styles from './PostJobs.module.css'; // Assuming you want to use the same styles
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const SelectionRules = ({ initialRules = {}, onChange }) => {
    const [rules, setRules] = useState(initialRules);

    const handleInputChange = useCallback((name, value) => {
        setRules(prevRules => ({ ...prevRules, [name]: value }));
        onChange({ ...rules, [name]: value }); // Notify parent component of changes
    }, [rules, onChange]);

    const handleCheckboxChange = useCallback((name, checked) => {
        setRules(prevRules => ({ ...prevRules, [name]: checked }));
        onChange({ ...rules, [name]: checked }); // Notify parent component of changes
    }, [rules, onChange]);

    const handleArrayInputChange = useCallback((name, value) => {
        const values = value.split(',').map(item => item.trim());
        setRules(prevRules => ({ ...prevRules, [name]: values }));
        onChange({ ...rules, [name]: values }); // Notify parent component of changes
    }, [rules, onChange]);

    return (
        <div className={styles.selectionRules}>
            <h3 className={styles.sectionTitle}>Selection Rules</h3>

            <div className={styles.formGroup}>
                <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
                <Input
                    type="text"
                    id="requiredSkills"
                    name="requiredSkills"
                    value={rules.requiredSkills ? rules.requiredSkills.join(', ') : ''}
                    onChange={(e) => handleArrayInputChange('requiredSkills', e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <Label htmlFor="requiredDegrees">Required Degrees (comma-separated)</Label>
                <Input
                    type="text"
                    id="requiredDegrees"
                    name="requiredDegrees"
                    value={rules.requiredDegrees ? rules.requiredDegrees.join(', ') : ''}
                    onChange={(e) => handleArrayInputChange('requiredDegrees', e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <Label htmlFor="requiredCertifications">Required Certifications (comma-separated)</Label>
                <Input
                    type="text"
                    id="requiredCertifications"
                    name="requiredCertifications"
                    value={rules.requiredCertifications ? rules.requiredCertifications.join(', ') : ''}
                    onChange={(e) => handleArrayInputChange('requiredCertifications', e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <Label htmlFor="requiredTools">Required Tools (comma-separated)</Label>
                <Input
                    type="text"
                    id="requiredTools"
                    name="requiredTools"
                    value={rules.requiredTools ? rules.requiredTools.join(', ') : ''}
                    onChange={(e) => handleArrayInputChange('requiredTools', e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <Label htmlFor="minimumExperience">Minimum Experience (in years)</Label>
                <Input
                    type="number"
                    id="minimumExperience"
                    name="minimumExperience"
                    value={rules.minimumExperience || ''}
                    onChange={(e) => handleInputChange('minimumExperience', e.target.value)}
                />
            </div>

            {/* You can add more rules as needed, e.g., specific keywords in resume/cover letter */}

            {/* Example of a boolean rule */}
            <div className={styles.formGroup}>
                <Label className={styles.checkboxLabel}>
                    <Checkbox
                        name="mustHavePortfolio"
                        checked={rules.mustHavePortfolio || false}
                        onCheckedChange={(checked) => handleCheckboxChange('mustHavePortfolio', checked)}
                    />
                    Must have a portfolio
                </Label>
            </div>

            {/* Add more complex rules with dropdowns or other input types if necessary */}

        </div>
    );
};

export default SelectionRules;