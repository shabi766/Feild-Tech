import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Empty State component for when there's no data to display
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.title - Main title
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Optional action button/element
 * @param {string} props.className - Additional classes
 */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 px-6 text-center",
                className
            )}
            {...props}
        >
            {/* Icon container with gradient background */}
            {Icon && (
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-full blur-2xl"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent/10 to-accent-light/10 flex items-center justify-center">
                        <Icon className="h-10 w-10 text-muted-foreground" />
                    </div>
                </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    {description}
                </p>
            )}

            {/* Action */}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
