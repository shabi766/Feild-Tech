import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* ---------- animated number counter ---------- */
const useCounter = (target, duration = 900, enabled = true) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) { setValue(target); return; }
    const numericTarget = parseFloat(String(target).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericTarget)) { setValue(target); return; }

    let startTime = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out-expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(startValue + (numericTarget - startValue) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);

  return value;
};

/**
 * Premium StatCard
 *
 * Props:
 *   title       string
 *   value       string | number
 *   icon        Lucide component
 *   gradient    Tailwind gradient string  "from-blue-500 to-indigo-600"
 *   subtitle    string
 *   change      number   (percentage change, optional)
 *   trend       'up' | 'down'
 *   loading     boolean
 *   className   string
 *   delay       number (ms, for stagger)
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient = 'from-primary to-primary-dark',
  subtitle,
  change,
  trend,
  loading = false,
  className,
  delay = 0,
  ...props
}) => {
  const isNumeric = typeof value === 'number' ||
    (typeof value === 'string' && !isNaN(parseFloat(value.replace(/[^0-9.-]/g, ''))));

  const prefix = typeof value === 'string'
    ? value.replace(/[\d,.]+.*/, '').trim()
    : '';
  const suffix = typeof value === 'string'
    ? value.replace(/^[^0-9-]*[\d,.]+/, '').trim()
    : '';

  const numericValue = isNumeric
    ? parseFloat(String(value).replace(/[^0-9.-]/g, ''))
    : 0;

  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  const countedValue = useCounter(numericValue, 800, visible && isNumeric && !loading);

  const displayValue = isNumeric
    ? `${prefix}${countedValue.toLocaleString()}${suffix}`
    : value;

  if (loading) {
    return (
      <div className={cn('card-elevated p-5', className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2.5">
            <div className="skeleton-item h-3.5 w-24 rounded" />
            <div className="skeleton-item h-8  w-20 rounded" />
            <div className="skeleton-item h-3  w-32 rounded" />
          </div>
          <div className="skeleton-item w-12 h-12 rounded-xl flex-shrink-0" />
        </div>
      </div>
    );
  }

  const isUp   = trend === 'up'   || (change !== undefined && change > 0);
  const isDown = trend === 'down' || (change !== undefined && change < 0);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay / 1000, ease: [0, 0, 0.2, 1] }}
      className={cn('group relative card-elevated p-5 overflow-hidden', className)}
      {...props}
    >
      {/* Subtle gradient wash on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none`}
      />

      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
            {title}
          </p>
          <p className="text-[1.75rem] font-bold leading-none text-foreground mb-1 tabular-nums animate-count-up">
            {displayValue}
          </p>

          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isUp   && <TrendingUp   className="h-3 w-3 text-emerald-500" />}
              {isDown && <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={cn(
                'text-xs font-semibold',
                isUp   ? 'text-emerald-600' :
                isDown ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={cn(
          'relative flex-shrink-0 p-3 rounded-xl shadow-md transition-all duration-300',
          'bg-gradient-to-br',
          gradient,
          'group-hover:scale-105 group-hover:shadow-lg'
        )}>
          {Icon && <Icon className="h-5 w-5 text-white" strokeWidth={2} />}
        </div>
      </div>

      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-[calc(var(--radius)+4px)] ring-1 ring-primary/0 group-hover:ring-primary/15 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default StatCard;
