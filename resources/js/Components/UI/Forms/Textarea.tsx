import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string | null;
    hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            label,
            error,
            hint,
            id,
            disabled,
            required,
            rows = 3,
            ...props
        },
        ref
    ) => {
        const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                        {label}
                        {required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                    className={cn(
                        'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                        'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
                        error
                            ? 'border-rose-400 text-rose-900 focus-visible:border-rose-500 focus-visible:ring-rose-500'
                            : 'border-slate-300 focus-visible:border-red-600 focus-visible:ring-red-600',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
