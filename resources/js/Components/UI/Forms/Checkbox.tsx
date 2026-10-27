import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    description?: string;
    error?: string | null;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, description, error, id, checked, disabled, ...props }, ref) => {
        const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="flex items-start gap-2.5">
                <div className="relative flex items-center pt-0.5">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={checkboxId}
                        checked={checked}
                        disabled={disabled}
                        className={cn(
                            'peer h-4 w-4 shrink-0 rounded border border-slate-300 bg-white text-red-600',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200 cursor-pointer',
                            error && 'border-rose-400',
                            className
                        )}
                        {...props}
                    />
                </div>
                {(label || description) && (
                    <div className="text-sm">
                        {label && (
                            <label
                                htmlFor={checkboxId}
                                className={cn(
                                    'font-medium text-slate-800 select-none cursor-pointer',
                                    disabled && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                {label}
                            </label>
                        )}
                        {description && <p className="text-xs text-slate-500">{description}</p>}
                        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                    </div>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
