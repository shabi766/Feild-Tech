import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const RatingStar = ({
    rating = 0,
    maxRating = 5,
    onRatingChange,
    readOnly = false,
    size = "md",
    className
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8"
    };

    const handleMouseEnter = (index) => {
        if (!readOnly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(index);
        }
    };

    return (
        <div className={cn("flex space-x-1", className)}>
            {[...Array(maxRating)].map((_, i) => {
                const index = i + 1;
                const isFilled = index <= (hoverRating || rating);
                const isHovered = index <= hoverRating;

                return (
                    <button
                        key={index}
                        type="button"
                        className={cn(
                            "transition-colors focus:outline-none",
                            readOnly ? "cursor-default" : "cursor-pointer"
                        )}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                        disabled={readOnly}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                                isHovered && !readOnly ? "fill-yellow-200 text-yellow-200" : ""
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default RatingStar;
