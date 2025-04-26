import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CustomFieldItem = ({ field, onRemove, onUpdate, isDragging, dragHandleProps }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      style={{
        opacity: isDragging ? 0.6 : 1,
        border: isDragging ? '2px dashed #ccc' : '1px solid #e0e0e0',
        backgroundColor: isDragging ? '#f9f9f9' : 'white',
      }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-md shadow-md transition-all duration-300", // Added shadow-md and transition
        "bg-white/90 backdrop-blur-sm border-gray-200" // Added background and border for better look
      )}
    >
      <div {...dragHandleProps} className="cursor-grab">
        <GripVertical className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Made responsive grid */}
        <div>
          <Label htmlFor={`label-${field.id}`} className="text-gray-700 font-medium">Label</Label>
          <Input
            id={`label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            placeholder="e.g., Education Level"
            className="mt-1 bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500" // Added focus styles
          />
        </div>
        <div>
          <Label htmlFor={`value-${field.id}`} className="text-gray-700 font-medium">Value</Label>
          <Input
            id={`value-${field.id}`}
            value={String(field.value)}
            onChange={(e) => onUpdate(field.id, { value: e.target.value })}
            placeholder="e.g., Bachelor's Degree, Experience in years"
            className="mt-1 bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500" // Added focus styles
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(field.id)}
        className="text-red-500 hover:bg-red-100/80 transition-colors duration-200" // Added hover effect
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </motion.div>
  );
};

const CustomFields = ({ fields, onChange }) => {
  const [localFields, setLocalFields] = useState(fields);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const handleAddField = useCallback(() => {
    const newField = {
      id: crypto.randomUUID(),
      label: '',
      value: '',
    };
    const updatedFields = [...localFields, newField];
    setLocalFields(updatedFields);
    onChange(updatedFields);
  }, [localFields, onChange]);

  const handleRemoveField = useCallback((id) => {
    const updatedFields = localFields.filter((field) => field.id !== id);
    setLocalFields(updatedFields);
    onChange(updatedFields);
  }, [localFields, onChange]);

  const handleUpdateField = useCallback(
    (id, updates) => {
      const updatedFields = localFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      );
      setLocalFields(updatedFields);
      onChange(updatedFields);
    },
    [localFields, onChange]
  );

  return (
    <div className="space-y-6"> {/* Increased spacing */}
      <h2 className="text-2xl font-semibold text-gray-900">Custom Fields</h2> {/* Increased heading size and weight */}
      <div className="space-y-4">
        <AnimatePresence>
          {localFields.map((field, index) => (
            <CustomFieldItem
              key={field.id}
              field={field}
              onRemove={handleRemoveField}
              onUpdate={handleUpdateField}
            />
          ))}
        </AnimatePresence>
      </div>
      <Button
        onClick={handleAddField}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-300" // Added styling to button
      >
        <Plus className="mr-2 w-5 h-5" />
        Add Custom Field
      </Button>
    </div>
  );
};

export default CustomFields;
