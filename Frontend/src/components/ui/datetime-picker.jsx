import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DateTimePicker = ({ 
    value, 
    onChange, 
    placeholder = "Pick a date and time",
    className,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Parse the value - it could be a Date object or a string
    const dateValue = value instanceof Date ? value : new Date(value || Date.now());
    
    // Format date and time for input fields
    const dateString = dateValue.toISOString().split('T')[0];
    const timeString = dateValue.toTimeString().slice(0, 5);
    
    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        newDate.setHours(dateValue.getHours(), dateValue.getMinutes());
        onChange(newDate);
    };
    
    const handleTimeChange = (e) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = new Date(dateValue);
        newDate.setHours(hours, minutes);
        onChange(newDate);
    };
    
    const formatDisplayValue = () => {
        if (!value) return placeholder;
        try {
            return `${dateValue.toLocaleDateString()} at ${dateValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } catch {
            return placeholder;
        }
    };
    
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDisplayValue()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Date</Label>
                        <Input
                            type="date"
                            value={dateString}
                            onChange={handleDateChange}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Time</Label>
                        <Input
                            type="time"
                            value={timeString}
                            onChange={handleTimeChange}
                            className="w-full"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default DateTimePicker;
