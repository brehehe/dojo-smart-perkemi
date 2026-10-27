import React from 'react';
import { cn } from '@/lib/utils';

export interface FormGroupProps {
    label?: string;
    htmlFor?: string;
    error?: string | null;
    hint?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const FormGroup: React.FC<FormGroupProps> = ({
    label,
    htmlFor,
    error,
    hint,
    required = false,
    className,
    children,
}) => {
    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                    {label}
                    {required && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}
            {children}
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
    );
};
