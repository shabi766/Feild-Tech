import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading Skeleton component for content placeholders
 */
export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-shimmer rounded-md bg-muted", className)}
            {...props}
        />
    );
};

/**
 * Card Skeleton for loading states
 */
export const CardSkeleton = ({ className }) => {
    return (
        <div className={cn("card-elevated p-6", className)}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
};

/**
 * List Item Skeleton
 */
export const ListItemSkeleton = ({ className }) => {
    return (
        <div className={cn("flex items-center space-x-4 p-4", className)}>
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
};

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 4 }) => {
    return (
        <div className="flex items-center space-x-4 p-4 border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
};

/**
 * Dashboard Skeleton - Full page loading state
 */
export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card-elevated p-6">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <ListItemSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                    <div className="card-elevated p-6">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <ListItemSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
