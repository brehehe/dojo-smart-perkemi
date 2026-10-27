import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string | null;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            hint,
            id,
            leftIcon,
            rightIcon,
            disabled,
            required,
            ...props
        },
        ref
    ) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                        {label}
                        {required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                )}
                <div className="relative rounded-lg shadow-sm">
                    {leftIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        required={required}
                        className={cn(
                            'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
                            error
                                ? 'border-rose-400 text-rose-900 focus-visible:border-rose-500 focus-visible:ring-rose-500'
                                : 'border-slate-300 focus-visible:border-red-600 focus-visible:ring-red-600',
                            leftIcon && 'pl-9',
                            rightIcon && 'pr-9',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
