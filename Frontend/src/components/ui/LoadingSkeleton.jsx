import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ---- Base skeleton block ---- */
export const Skeleton = ({ className, ...props }) => (
  <div className={cn('skeleton-item', className)} {...props} />
);

/* ---- Single stat card skeleton ---- */
export const CardSkeleton = ({ className }) => (
  <div className={cn('card-elevated p-5', className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-7 w-16 rounded" />
        <Skeleton className="h-2.5 w-28 rounded" />
      </div>
      <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
    </div>
  </div>
);

/* ---- List item with avatar ---- */
export const ListItemSkeleton = ({ className }) => (
  <div className={cn('flex items-center gap-3 px-3 py-3', className)}>
    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4 rounded" />
      <Skeleton className="h-2.5 w-1/2 rounded" />
    </div>
    <Skeleton className="h-5 w-14 rounded-full flex-shrink-0" />
  </div>
);

/* ---- Table row ---- */
export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border/60">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className="h-3.5 flex-1 rounded" />
    ))}
  </div>
);

/* ---- Activity row ---- */
const ActivityRowSkeleton = () => (
  <div className="flex items-start gap-3 px-3 py-3.5">
    <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-1.5" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-2/3 rounded" />
      <Skeleton className="h-2.5 w-1/2 rounded" />
    </div>
    <Skeleton className="h-5 w-14 rounded-full flex-shrink-0" />
  </div>
);

/* ---- Full dashboard loading skeleton ---- */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const DashboardSkeleton = () => (
  <motion.div
    className="w-full min-h-screen bg-background p-6"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-80 rounded" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </motion.div>

      {/* Company / feature banner */}
      <motion.div variants={itemVariants} className="card-elevated p-6 border-t-[3px] border-primary">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-60 rounded" />
          </div>
          <div className="hidden md:flex gap-6">
            {[80, 72, 88].map((w, i) => (
              <div key={i} className="space-y-1.5 text-center">
                <Skeleton className={`h-5 w-${w > 80 ? 10 : 8} rounded mx-auto`} />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stat grid — 4 columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </motion.div>

      {/* Two-column content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="card-elevated p-5 space-y-4">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50">
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-2.5 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card-elevated p-5 space-y-2">
          <Skeleton className="h-4 w-36 rounded mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </div>
      </motion.div>

    </div>
  </motion.div>
);

export default Skeleton;
