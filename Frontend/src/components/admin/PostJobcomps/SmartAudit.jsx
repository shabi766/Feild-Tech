import React, { useState, useCallback, useEffect } from 'react';
import styles from './SmartAudit.module.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const AuditRuleItem = ({ rule, index, onRuleChange, onRemoveRule }) => {
    // We can define the change handler right here, using the index
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        onRuleChange(index, { ...rule, [name]: value });
    }, [index, rule, onRuleChange]);

    return (
        <div className={styles.auditRuleItem}>
            <div className={styles.ruleHeader}>
                <h4 className={styles.ruleTitle}>Rule #{index + 1}</h4>
                <Button 
                    onClick={() => onRemoveRule(index)} 
                    variant="destructive" // Assuming your Button component has a destructive variant for red color
                    className="py-1 px-3"
                >
                    Remove
                </Button>
            </div>
            
            <div className={styles.formGroup}>
                <Label htmlFor={`description-${rule.id}`}>Description</Label>
                <Input
                    type="text"
                    id={`description-${rule.id}`}
                    name="description"
                    value={rule.description || ''}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <Label htmlFor={`weight-${rule.id}`}>Weight (e.g., 1-5, importance)</Label>
                <Input
                    type="number"
                    id={`weight-${rule.id}`}
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
        </div>
    );
};

const SmartAudit = ({ initialRules = [], onAuditRulesChange }) => {
    // Initialize with unique IDs for new rules
    const [auditRules, setAuditRules] = useState(() => 
        initialRules.map(rule => ({ ...rule, id: rule.id || Date.now() + Math.random() }))
    );

    // Sync initialRules prop with internal state
    useEffect(() => {
      setAuditRules(initialRules.map(rule => ({ ...rule, id: rule.id || Date.now() + Math.random() })));
    }, [initialRules]);
    
    const handleRuleChange = useCallback((index, newRule) => {
        setAuditRules(prevRules => {
            const updatedRules = [...prevRules];
            updatedRules[index] = newRule;
            onAuditRulesChange(updatedRules); // Notify parent
            return updatedRules;
        });
    }, [onAuditRulesChange]);

    const handleAddRule = useCallback(() => {
        const newRule = { id: Date.now() + Math.random(), description: '', weight: 0, isRequired: false };
        setAuditRules(prevRules => {
            const updatedRules = [...prevRules, newRule];
            onAuditRulesChange(updatedRules); // Notify parent
            return updatedRules;
        });
    }, [onAuditRulesChange]);

    const handleRemoveRule = useCallback((indexToRemove) => {
        setAuditRules(prevRules => {
            const updatedRules = prevRules.filter((_, index) => index !== indexToRemove);
            onAuditRulesChange(updatedRules); // Notify parent
            return updatedRules;
        });
    }, [onAuditRulesChange]);

    return (
        <div className={styles.smartAuditContainer}>
            <h2 className={styles.smartAuditTitle}>Smart Audit Configuration</h2>
            <p className={styles.description}>Define the rules and criteria for your smart audit.</p>

            {auditRules.map((rule, index) => (
                <AuditRuleItem
                    key={rule.id} // Use a unique ID for the key
                    rule={rule}
                    index={index}
                    onRuleChange={handleRuleChange}
                    onRemoveRule={handleRemoveRule}
                />
            ))}

            <Button onClick={handleAddRule} className="mt-4">
                Add Audit Rule
            </Button>
        </div>
    );
};

export default SmartAudit;