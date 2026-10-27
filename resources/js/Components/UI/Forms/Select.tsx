import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string | null;
    hint?: string;
    options?: SelectOption[];
    placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            hint,
            id,
            options = [],
            placeholder,
            disabled,
            required,
            children,
            ...props
        },
        ref
    ) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                        {label}
                        {required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                )}
                <div className="relative rounded-lg shadow-sm">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        required={required}
                        className={cn(
                            'block w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-900',
                            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer',
                            error
                                ? 'border-rose-400 text-rose-900 focus-visible:border-rose-500 focus-visible:ring-rose-500'
                                : 'border-slate-300 focus-visible:border-red-600 focus-visible:ring-red-600',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.length > 0
                            ? options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                  </option>
                              ))
                            : children}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
                {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
