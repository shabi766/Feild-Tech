import React, { useState, useCallback } from 'react';
import styles from './SmartAudit.module.css'; // Create a CSS module for this component
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const AuditRuleItem = ({ rule, index, onRuleChange, onRemoveRule }) => {
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        onRuleChange(index, { ...rule, [name]: value });
    }, [index, rule, onRuleChange]);

    const handleCheckboxChange = useCallback((e) => {
        const { name, checked } = e.target;
        onRuleChange(index, { ...rule, [name]: checked });
    }, [index, rule, onRuleChange]);

    return (
        <div className={styles.auditRuleItem}>
            <h4 className={styles.ruleTitle}>Rule #{index + 1}</h4>
            <div className={styles.formGroup}>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input
                    type="text"
                    id={`description-${index}`}
                    name="description"
                    value={rule.description || ''}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <Label htmlFor={`weight-${index}`}>Weight (e.g., 1-5, importance)</Label>
                <Input
                    type="number"
                    id={`weight-${index}`}
                    name="weight"
                    value={rule.weight || ''}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <Label className={styles.checkboxLabel}>
                    <Checkbox
                        name="isRequired"
                        checked={rule.isRequired || false}
                        onCheckedChange={(checked) => onRuleChange(index, { ...rule, isRequired: checked })}
                    />
                    Is Required
                </Label>
            </div>
            <Button onClick={() => onRemoveRule(index)} className="bg-red-500 text-white py-2 px-4 rounded-md mt-2">
                Remove Rule
            </Button>
        </div>
    );
};

const SmartAudit = ({ initialRules = [], onAuditRulesChange }) => {
    const [auditRules, setAuditRules] = useState(initialRules);

    const handleRuleChange = useCallback((index, newRule) => {
        const updatedRules = [...auditRules];
        updatedRules[index] = newRule;
        setAuditRules(updatedRules);
        onAuditRulesChange(updatedRules); // Notify parent
    }, [auditRules, onAuditRulesChange]);

    const handleAddRule = useCallback(() => {
        setAuditRules([...auditRules, {}]);
    }, [auditRules]);

    const handleRemoveRule = useCallback((indexToRemove) => {
        setAuditRules(auditRules.filter((_, index) => index !== indexToRemove));
        onAuditRulesChange(auditRules.filter((_, index) => index !== indexToRemove)); // Notify parent
    }, [auditRules, onAuditRulesChange]);

    return (
        <div className={styles.smartAuditContainer}>
            <h2 className={styles.smartAuditTitle}>Smart Audit Configuration</h2>
            <p className={styles.description}>Define the rules and criteria for your smart audit.</p>

            {auditRules.map((rule, index) => (
                <AuditRuleItem
                    key={index}
                    rule={rule}
                    index={index}
                    onRuleChange={handleRuleChange}
                    onRemoveRule={handleRemoveRule}
                />
            ))}

            <Button onClick={handleAddRule} className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4">
                Add Audit Rule
            </Button>
        </div>
    );
};

export default SmartAudit;