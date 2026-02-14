import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced StatCard component with animations and modern design
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.gradient - Tailwind gradient classes (e.g., "from-blue-500 to-indigo-600")
 * @param {string} props.subtitle - Optional subtitle text
 * @param {number} props.change - Optional percentage change
 * @param {string} props.trend - Optional trend indicator ('up' | 'down')
 * @param {boolean} props.loading - Show loading skeleton
 * @param {string} props.className - Additional classes
 */
export const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient = "from-primary to-primary-dark",
    subtitle,
    change,
    trend,
    loading = false,
    className,
    ...props
}) => {
    if (loading) {
        return (
            <div className={cn("card-elevated p-6", className)}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-24 bg-muted animate-shimmer rounded"></div>
                        <div className="h-8 w-16 bg-muted animate-shimmer rounded"></div>
                        {subtitle && <div className="h-3 w-32 bg-muted animate-shimmer rounded"></div>}
                    </div>
                    <div className="w-14 h-14 bg-muted animate-shimmer rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group relative card-elevated p-6 hover-lift overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            <div className="relative flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-bold text-foreground mb-1">{value}</p>

                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}

                    {change !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={cn(
                                "text-sm font-medium",
                                trend === 'up' || change > 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                            <span className="text-xs text-muted-foreground">from last month</span>
                        </div>
                    )}
                </div>

                {/* Icon container */}
                <div className={cn(
                    "relative p-4 rounded-xl shadow-lg transition-all duration-300",
                    "bg-gradient-to-br",
                    gradient,
                    "group-hover:scale-110 group-hover:rotate-6"
                )}>
                    {Icon && <Icon className="h-6 w-6 text-white" />}

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            </div>

            {/* Animated border on hover */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
        </div>
    );
};

export default StatCard;
