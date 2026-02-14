import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-800",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  pulse = false,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), pulse && "animate-pulse", className)} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {props.children}
    </div>
  );
}

/**
 * Status Badge - Predefined status badges
 */
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    active: { variant: "success", text: "Active" },
    inactive: { variant: "secondary", text: "Inactive" },
    pending: { variant: "warning", text: "Pending", pulse: true },
    completed: { variant: "info", text: "Completed" },
    cancelled: { variant: "destructive", text: "Cancelled" },
    draft: { variant: "outline", text: "Draft" },
  };

  const config = statusConfig[status?.toLowerCase()] || { variant: "default", text: status };

  return (
    <Badge variant={config.variant} pulse={config.pulse} {...props}>
      {config.text}
    </Badge>
  );
};

export { Badge, badgeVariants }

