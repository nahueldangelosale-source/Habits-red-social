/**
 * Button Primitive — Design System
 * Accessible, theme-aware button with semantic CSS classes.
 * 
 * Usage: <Button variant="primary" size="md">Save</Button>
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * UTILITY: cn 
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading, icon, children, className = '', disabled, ...props }, ref) => {
        const classes = `btn btn-${variant} btn-${size} ${className}`.trim();

        return (
            <motion.button
                ref={ref}
                whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
                className={classes}
                disabled={disabled || isLoading}
                {...(props as any)}
            >
                {isLoading ? (
                    <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
                ) : icon ? (
                    icon
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
