import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'navy' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            disabled = false,
            leftIcon,
            rightIcon,
            type = 'button',
            ...props
        },
        ref
    ) => {
        const variants = {
            primary:
                'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600 shadow-sm border border-transparent',
            navy:
                'bg-[#0B132B] text-white hover:bg-[#1C2541] active:bg-[#070b1a] focus-visible:ring-slate-900 shadow-sm border border-transparent',
            secondary:
                'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-200',
            outline:
                'bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 focus-visible:ring-slate-500',
            danger:
                'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 focus-visible:ring-rose-500',
            ghost:
                'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus-visible:ring-slate-400',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs gap-1.5 rounded-md font-medium',
            md: 'h-9 px-4 text-sm gap-2 rounded-lg font-medium',
            lg: 'h-11 px-5 text-base gap-2.5 rounded-lg font-semibold',
        };

        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                ) : (
                    leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
                )}
                <span>{children}</span>
                {!isLoading && rightIcon && (
                    <span className="inline-flex shrink-0">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
