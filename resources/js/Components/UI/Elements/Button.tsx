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
                'bg-[#C51C2A] text-white hover:bg-[#a51522] active:bg-[#8f121d] focus-visible:ring-[#C51C2A] shadow-xs border border-transparent',
            navy:
                'bg-[#102B40] text-white hover:bg-[#1A3B52] active:bg-[#24475E] focus-visible:ring-[#102B40] shadow-xs border border-transparent',
            secondary:
                'bg-slate-100 text-[#17202D] hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-[#E8EBEF]',
            outline:
                'bg-transparent text-[#17202D] hover:bg-slate-50 active:bg-slate-100 border border-[#E8EBEF] focus-visible:ring-[#102B40]',
            danger:
                'bg-rose-50 text-[#DC3545] hover:bg-rose-100 active:bg-rose-200 border border-rose-200 focus-visible:ring-rose-500',
            ghost:
                'bg-transparent text-[#718092] hover:bg-slate-100 hover:text-[#17202D] border border-transparent focus-visible:ring-[#102B40]',
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
