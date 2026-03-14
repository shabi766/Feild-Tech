import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-xl text-sm font-semibold',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline:     'border border-border bg-background hover:bg-muted hover:border-primary/30 text-foreground',
        secondary:   'bg-muted text-foreground hover:bg-muted/80',
        ghost:       'hover:bg-muted text-foreground',
        link:        'text-primary underline-offset-4 hover:underline p-0 h-auto',
        gradient:    'gradient-ocean text-white shadow-md hover:shadow-primary/30 hover:shadow-lg hover:opacity-95',
        success:     'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md',
        warning:     'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md',
        ocean:       'gradient-ocean-light text-white shadow-md hover:opacity-95 hover:shadow-lg',
        accent:      'gradient-accent text-white shadow-md hover:opacity-95 hover:shadow-lg',
        premium:     'gradient-premium text-white shadow-lg hover:opacity-95 hover:shadow-xl',
      },
      size: {
        sm:      'h-8  px-3    text-xs',
        default: 'h-9  px-4',
        lg:      'h-10 px-5',
        xl:      'h-11 px-6   text-base',
        icon:    'h-9  w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Spinner = () => (
  <svg
    className="animate-spin h-3.5 w-3.5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * GradientButton — premium button with press feedback via Framer Motion
 *
 * Props:
 *   variant    string
 *   size       string
 *   loading    boolean
 *   leftIcon   ReactNode
 *   rightIcon  ReactNode
 */
export const GradientButton = React.forwardRef(
  ({ className, variant, size, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {loading  && <Spinner />}
        {!loading && leftIcon}
        {children && <span>{children}</span>}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

GradientButton.displayName = 'GradientButton';

export { buttonVariants };
export default GradientButton;
