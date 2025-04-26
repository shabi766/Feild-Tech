import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, ListChecks } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const TaskItem = ({ task, onRemove, onUpdate, isDragging, dragHandleProps }) => {
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
                "flex items-start gap-4 p-4 rounded-md shadow-md transition-all duration-300",
                "bg-white/90 backdrop-blur-sm border-gray-200"
            )}
        >
            <div {...dragHandleProps} className="cursor-grab mt-1">
                <GripVertical className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
                <Label className="block text-sm font-medium text-gray-700">Task Description</Label>
                <Textarea
                    value={task.description}
                    onChange={(e) => onUpdate(task.id, { description: e.target.value })}
                    placeholder="Enter task description"
                    className="mt-1 w-full bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 min-h-[2.5rem] resize-y"
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.preventDefault(); // Prevent default form submission
                    onRemove(task.id);
                }}
                className="text-red-500 hover:bg-red-100/80 transition-colors duration-200 mt-6"
            >
                <Trash2 className="w-5 h-5" />
            </Button>
        </motion.div>
    );
};

const JobTasks = ({ tasks, onChange }) => {
    const [localTasks, setLocalTasks] = useState(tasks);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const handleAddTask = useCallback((e) => {
        e.preventDefault(); // Prevent default form submission
        const newTask = {
            id: crypto.randomUUID(),
            description: '',
            completed: false,
        };
        const updatedTasks = [...localTasks, newTask];
        setLocalTasks(updatedTasks);
        onChange(updatedTasks);
    }, [localTasks, onChange]);

    const handleRemoveTask = useCallback((id) => {
        const updatedTasks = localTasks.filter((task) => task.id !== id);
        setLocalTasks(updatedTasks);
        onChange(updatedTasks);
    }, [localTasks, onChange]);

    const handleUpdateTask = useCallback(
        (id, updates) => {
            const updatedTasks = localTasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task
            );
            setLocalTasks(updatedTasks);
            onChange(updatedTasks);
        },
        [localTasks, onChange]
    );


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-6 h-6" />
                Job Tasks
            </h2>
            <div className="space-y-4">
                <AnimatePresence>
                    {localTasks.map((task, index) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onRemove={handleRemoveTask}
                            onUpdate={handleUpdateTask}
                        />
                    ))}
                </AnimatePresence>
            </div>
            <Button
                onClick={handleAddTask}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-300 flex items-center justify-center"
            >
                <Plus className="mr-2 w-5 h-5" />
                Add Task
            </Button>
        </div>
    );
};

export default JobTasks;
