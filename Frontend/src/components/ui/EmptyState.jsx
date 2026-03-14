import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * EmptyState — premium illustration-style empty state
 *
 * Props:
 *   icon        Lucide component
 *   title       string
 *   description string
 *   action      ReactNode
 *   className   string
 */
export const EmptyState = ({ icon: Icon, title, description, action, className, ...props }) => (
  <motion.div
    className={cn(
      'flex flex-col items-center justify-center py-14 px-6 text-center',
      className
    )}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
    {...props}
  >
    {Icon && (
      <div className="relative mb-5">
        {/* Soft glow behind icon */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
          <Icon className="h-8 w-8 text-primary/60" strokeWidth={1.5} />
        </div>
      </div>
    )}

    <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>

    {description && (
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
        {description}
      </p>
    )}

    {action && <div className="mt-1">{action}</div>}
  </motion.div>
);

export default EmptyState;
