import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'; // You'll need to install this library
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// A single item in the list of custom fields
const CustomFieldItem = ({ field, onRemove, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg shadow-sm transition-all duration-300",
        "bg-white border border-gray-200",
        isDragging && "ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-gray-500 hover:text-gray-900 transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`label-${field.id}`} className="text-sm text-gray-600 font-medium">Label</Label>
          <Input
            id={`label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            placeholder="e.g., Education Level"
            className="mt-1 bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 rounded-md"
          />
        </div>
        <div>
          <Label htmlFor={`value-${field.id}`} className="text-sm text-gray-600 font-medium">Value</Label>
          <Input
            id={`value-${field.id}`}
            value={String(field.value)}
            onChange={(e) => onUpdate(field.id, { value: e.target.value })}
            placeholder="e.g., Bachelor's Degree, Experience"
            className="mt-1 bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 rounded-md"
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onRemove(field.id);
        }}
        className="text-red-500 hover:bg-red-100/80 transition-colors duration-200"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </motion.div>
  );
};

// The main component that manages the list of custom fields
const CustomFields = ({ fields, onChange }) => {
  const [localFields, setLocalFields] = useState(fields);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const handleAddField = useCallback(() => {
    const newField = {
      id: `custom-field-${Date.now()}`, // Using a timestamp is more reliable than crypto.randomUUID for client-side keys
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

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localFields.findIndex((field) => field.id === active.id);
      const newIndex = localFields.findIndex((field) => field.id === over.id);
      
      const newArray = [...localFields];
      const [movedItem] = newArray.splice(oldIndex, 1);
      newArray.splice(newIndex, 0, movedItem);
      
      setLocalFields(newArray);
      onChange(newArray);
    }
  }, [localFields, onChange]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Custom Fields</h2>
          <p className="text-gray-500 mt-2">
            Add custom key-value pairs to provide more detail about the job.
          </p>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={localFields} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            <AnimatePresence>
              {localFields.map((field) => (
                <CustomFieldItem
                  key={field.id}
                  field={field}
                  onRemove={handleRemoveField}
                  onUpdate={handleUpdateField}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      <Button
        onClick={(e) => {
          e.preventDefault();
          handleAddField();
        }}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300"
      >
        <Plus className="mr-2 w-5 h-5" />
        Add New Field
      </Button>
    </div>
  );
};

export default CustomFields;